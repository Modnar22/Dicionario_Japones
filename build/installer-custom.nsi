# =====================================================================
# Script NSIS custom do Jap-Dex (electron-builder: nsis.script)
#
# Motivo: o fluxo padrao do electron-builder compila um "stub" do
# instalador, o EXECUTA para extrair o binario do desinstalador e entao
# recompila o instalador final. O Windows Smart App Control (ativo em
# modo imposicao nesta maquina) bloqueia a execucao de binarios nao
# assinados ("App Control policy blocked this file" / spawn UNKNOWN),
# o que impede o build do alvo NSIS.
#
# Este script faz tudo em FASE UNICA: o desinstalador e gerado em
# tempo de instalacao com WriteUninstaller - nenhuma execucao
# intermediaria e necessaria. O conteudo e identico ao template
# padrao (templates/nsis/installer.nsi + installSection.nsh), com
# duas modificacoes marcadas com "MODIFICACAO" abaixo.
# =====================================================================

Var newStartMenuLink
Var oldStartMenuLink
Var newDesktopLink
Var oldDesktopLink
Var oldShortcutName
Var oldMenuDirectory

!include "common.nsh"
!include "MUI2.nsh"
!include "multiUser.nsh"

# =====================================================================
# MODIFICACAO 3: hook customCheckAppRunning.
# O template usa CHECK_APP_RUNNING -> _CHECK_APP_RUNNING ->
# ${GetProcessInfo}, cujo macro faz "Call _GetProcessInfo" (sem prefixo
# "un.") escolhido via BUILD_UNINSTALLER - compila em duas fases, mas
# numa fase unica o Call dentro de Function un.* e erro de compilacao.
# Definindo customCheckAppRunning ANTES do include abaixo, o
# getProcessInfo.nsh nem e incluido e CHECK_APP_RUNNING usa esta versao
# nos DOIS contextos (secao do instalador e funcao un.*), sem nenhum
# Call de funcao (so plugins: nsExec/tasklist + MessageBox).
# =====================================================================
!macro customCheckAppRunning
  !insertmacro FIND_PROCESS "${APP_EXECUTABLE_FILENAME}" $R0
  ${if} $R0 == 0
    ${if} ${isUpdated}
      # allow app to exit without explicit kill
      Sleep 300
    ${endIf}
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "$(appRunning)" /SD IDOK IDOK doStopProcess
    Quit

    doStopProcess:

    DetailPrint `Closing running "${PRODUCT_NAME}"...`

    !ifdef INSTALL_MODE_PER_ALL_USERS
      nsExec::Exec `taskkill /im "${APP_EXECUTABLE_FILENAME}"`
    !else
      nsExec::Exec `"$SYSDIR\cmd.exe" /c taskkill /im "${APP_EXECUTABLE_FILENAME}" /fi "USERNAME eq %USERNAME%"`
    !endif
    # to ensure that files are not "in-use"
    Sleep 300

    StrCpy $R1 0

    loop:
      IntOp $R1 $R1 + 1

      !insertmacro FIND_PROCESS "${APP_EXECUTABLE_FILENAME}" $R0
      ${if} $R0 == 0
        # wait to give a chance to exit gracefully
        Sleep 1000
        !ifdef INSTALL_MODE_PER_ALL_USERS
          nsExec::Exec `taskkill /f /im "${APP_EXECUTABLE_FILENAME}"`
        !else
          nsExec::Exec `"$SYSDIR\cmd.exe" /c taskkill /f /im "${APP_EXECUTABLE_FILENAME}" /fi "USERNAME eq %USERNAME%"`
        !endif
        !insertmacro FIND_PROCESS "${APP_EXECUTABLE_FILENAME}" $R0
        ${If} $R0 == 0
          DetailPrint `Waiting for "${PRODUCT_NAME}" to close.`
          Sleep 2000
        ${Else}
          Goto not_running
        ${endIf}
      ${Else}
        Goto not_running
      ${endIf}

      # App likely running with elevated permissions.
      # Ask user to close it manually
      ${if} $R1 > 1
        MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(appCannotBeClosed)" /SD IDCANCEL IDRETRY loop
        Quit
      ${Else}
        Goto loop
      ${endIf}
    not_running:
  ${endIf}
!macroend

!include "allowOnlyOneInstallerInstance.nsh"

!ifdef INSTALL_MODE_PER_ALL_USERS
  !ifdef BUILD_UNINSTALLER
    RequestExecutionLevel user
  !else
    RequestExecutionLevel admin
  !endif
!else
  RequestExecutionLevel user
!endif

!ifdef BUILD_UNINSTALLER
  SilentInstall silent
!else
  Var appExe
  Var launchLink
!endif

!ifdef ONE_CLICK
  !include "oneClick.nsh"
!else
  !include "assistedInstaller.nsh"
!endif

!insertmacro addLangs

!ifmacrodef customHeader
  !insertmacro customHeader
!endif

Function .onInit
  Call setInstallSectionSpaceRequired

  SetOutPath $INSTDIR
  ${LogSet} on

  !ifmacrodef preInit
    !insertmacro preInit
  !endif

  !ifdef DISPLAY_LANG_SELECTOR
    !insertmacro MUI_LANGDLL_DISPLAY
  !endif

  !ifdef BUILD_UNINSTALLER
    WriteUninstaller "${UNINSTALLER_OUT_FILE}"
    !insertmacro quitSuccess
  !else
    !insertmacro check64BitAndSetRegView

    !ifdef ONE_CLICK
      !insertmacro ALLOW_ONLY_ONE_INSTALLER_INSTANCE
    !else
      ${IfNot} ${UAC_IsInnerInstance}
        !insertmacro ALLOW_ONLY_ONE_INSTALLER_INSTANCE
      ${EndIf}
    !endif

    !insertmacro initMultiUser

    !ifmacrodef customInit
      !insertmacro customInit
    !endif

    !ifmacrodef addLicenseFiles
      InitPluginsDir
      !insertmacro addLicenseFiles
    !endif
  !endif
FunctionEnd

!ifndef BUILD_UNINSTALLER
  !include "installUtil.nsh"
!endif

Section "install" INSTALL_SECTION_ID
  !ifndef BUILD_UNINSTALLER
    # If we're running a silent upgrade of a per-machine installation, elevate so extracting the new app will succeed.
    # For a non-silent install, the elevation will be triggered when the install mode is selected in the UI,
    # but that won't be executed when silent.
    !ifndef INSTALL_MODE_PER_ALL_USERS
      !ifndef ONE_CLICK
          ${if} $hasPerMachineInstallation == "1" # set in onInit by initMultiUser
          ${andIf} ${Silent}
            ${ifNot} ${UAC_IsAdmin}
              ShowWindow $HWNDPARENT ${SW_HIDE}
              !insertmacro UAC_RunElevated
              ${Switch} $0
                ${Case} 0
                  ${Break}
                ${Case} 1223 ;user aborted
                  ${Break}
                ${Default}
                  MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "Unable to elevate, error $0"
                  ${Break}
              ${EndSwitch}
              Quit
            ${else}
              !insertmacro setInstallModePerAllUsers
            ${endIf}
          ${endIf}
      !endif
    !endif

    # ---------------------------------------------------------------------
    # installSection.nsh inliniado (o include original nao e mais usado).
    # Identico ao template, exceto a MODIFICACAO 1 abaixo.
    # ---------------------------------------------------------------------
    !include installer.nsh

    InitPluginsDir

    ${IfNot} ${Silent}
      SetDetailsPrint none
    ${endif}

    StrCpy $appExe "$INSTDIR\${APP_EXECUTABLE_FILENAME}"

    # must be called before uninstallOldVersion
    !insertmacro setLinkVars

    !ifdef ONE_CLICK
      !ifdef HEADER_ICO
        File /oname=$PLUGINSDIR\installerHeaderico.ico "${HEADER_ICO}"
      !endif
      ${IfNot} ${Silent}
        !ifdef HEADER_ICO
          SpiderBanner::Show /MODERN /ICON "$PLUGINSDIR\installerHeaderico.ico"
        !else
          SpiderBanner::Show /MODERN
        !endif

        FindWindow $0 "#32770" "" $hwndparent
        FindWindow $0 "#32770" "" $hwndparent $0
        GetDlgItem $0 $0 1000
        SendMessage $0 ${WM_SETTEXT} 0 "STR:$(installing)"

        StrCpy $1 $hwndparent
        System::Call 'user32::ShutdownBlockReasonCreate(${SYSTYPE_PTR}r1, w "$(installing)")'
      ${endif}
      !insertmacro CHECK_APP_RUNNING
    !else
      ${ifNot} ${UAC_IsInnerInstance}
        !insertmacro CHECK_APP_RUNNING
      ${endif}
    !endif

    Var /GLOBAL keepShortcuts
    StrCpy $keepShortcuts "false"
    !insertMacro setIsTryToKeepShortcuts
    ${if} $isTryToKeepShortcuts == "true"
      ReadRegStr $R1 SHELL_CONTEXT "${INSTALL_REGISTRY_KEY}" KeepShortcuts

      ${if} $R1 == "true"
      ${andIf} ${FileExists} "$appExe"
        StrCpy $keepShortcuts "true"
      ${endIf}
    ${endif}

    !insertmacro uninstallOldVersion SHELL_CONTEXT
    !insertmacro handleUninstallResult SHELL_CONTEXT

    ${if} $installMode == "all"
      !insertmacro uninstallOldVersion HKEY_CURRENT_USER
      !insertmacro handleUninstallResult HKEY_CURRENT_USER
    ${endIf}

    SetOutPath $INSTDIR

    !ifdef UNINSTALLER_ICON
      File /oname=uninstallerIcon.ico "${UNINSTALLER_ICON}"
    !endif

    # =====================================================================
    # MODIFICACAO 1: no lugar de "!insertmacro installApplicationFiles"
    # (que extraia o pacote E embutia o desinstalador pre-compilado via
    # "${UNINSTALLER_OUT_FILE}" - exigindo a execucao do stub bloqueada
    # pelo Smart App Control), extraimos o aplicativo e geramos o
    # desinstalador em tempo de instalacao com WriteUninstaller.
    # Os macros extractEmbeddedAppPackage / copyFile sao os mesmos usados
    # pelo ramo else do template para instaladores com pacote 7z embutido.
    # =====================================================================
    !insertmacro extractEmbeddedAppPackage
    # electron always uses per user app data
    ${if} $installMode == "all"
      SetShellVarContext current
    ${endif}
    !insertmacro copyFile "$EXEPATH" "$LOCALAPPDATA\${APP_INSTALLER_STORE_FILE}"
    ${if} $installMode == "all"
      SetShellVarContext all
    ${endif}
    WriteUninstaller "$INSTDIR\${UNINSTALL_FILENAME}"
    # =====================================================================

    !insertmacro registryAddInstallInfo
    !insertmacro addStartMenuLink $keepShortcuts
    !insertmacro addDesktopLink $keepShortcuts

    ${if} ${FileExists} "$newStartMenuLink"
      StrCpy $launchLink "$newStartMenuLink"
    ${else}
      StrCpy $launchLink "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
    ${endIf}

    !ifmacrodef registerFileAssociations
      !insertmacro registerFileAssociations
    !endif

    !ifmacrodef customInstall
      !insertmacro customInstall
    !endif

    !macro doStartApp
      # otherwise app window will be in background
      HideWindow
      !insertmacro StartApp
    !macroend

    !ifdef ONE_CLICK
      # https://github.com/electron-userland/electron-builder/pull/3093#issuecomment-403734568
      !ifdef RUN_AFTER_FINISH
        ${ifNot} ${Silent}
        ${orIf} ${isForceRun}
          !insertmacro doStartApp
        ${endIf}
      !else
        ${if} ${isForceRun}
          !insertmacro doStartApp
        ${endIf}
      !endif
      !insertmacro quitSuccess
    !else
      # for assisted installer run only if silent, because assisted installer has run after finish option
      ${if} ${isForceRun}
      ${andIf} ${Silent}
        !insertmacro doStartApp
      ${endIf}
    !endif
    # ---------------------------------------------------------------------
    # Fim do installSection.nsh inliniado.
    # ---------------------------------------------------------------------
  !endif
SectionEnd

Function setInstallSectionSpaceRequired
  !insertmacro setSpaceRequired ${INSTALL_SECTION_ID}
FunctionEnd

# =====================================================================
# MODIFICACAO 2: no template padrao, uninstaller.nso so era incluido
# quando BUILD_UNINSTALLER estava definido (fase 1 - compilacao do stub).
# Aqui a compilacao e unica, entao o codigo do desinstalador e incluido
# sempre, para que WriteUninstaller o embuta no "Uninstall *.exe".
# =====================================================================
!include "uninstaller.nsh"
