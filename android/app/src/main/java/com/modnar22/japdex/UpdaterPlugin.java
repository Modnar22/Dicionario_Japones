package com.modnar22.japdex;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * v4.12 — Atualização DENTRO do app (Android), estilo update de aplicativo:
 *
 *  - download(url, fileName, token): baixa o APK da release do GitHub para o
 *    diretório externo do app (getExternalFilesDir — sem permissão de
 *    armazenamento) emitindo eventos "progress" {loaded, total};
 *  - install(path): abre o instalador do sistema via FileProvider. Na 1ª vez
 *    o Android exige a permissão "instalar apps desconhecidos": devolve
 *    { needsPermission: true } e já abre a tela de permissão.
 *
 * Mesma validação do Electron: só aceita endpoints da API do GitHub.
 */
@CapacitorPlugin(name = "Updater")
public class UpdaterPlugin extends Plugin {

    private final ExecutorService io = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName");
        String token = call.getString("token");

        // Só endpoints da API do GitHub (não é um "baixar URL" genérico)
        if (url == null || !url.startsWith("https://api.github.com/")) {
            call.reject("URL de download inválida");
            return;
        }

        // Nome de arquivo sanitizado (evita path traversal / caracteres raros)
        String safeName = "JapDexUpdate.apk";
        if (fileName != null) {
            String base = new File(fileName).getName().replaceAll("[^A-Za-z0-9._-]", "_");
            if (base.toLowerCase().endsWith(".apk")) safeName = base;
        }
        final String outName = safeName; // cópia final p/ captura no lambda

        io.execute(() -> {
            File dir = getContext().getExternalFilesDir(null);
            if (dir == null) dir = getContext().getFilesDir();
            final File dest = new File(dir, outName);
            if (dest.exists()) dest.delete();

            HttpURLConnection conn = null;
            try {
                conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(60000);
                conn.setInstanceFollowRedirects(true);
                conn.setRequestProperty("User-Agent", "Jap-Dex-Updater");
                conn.setRequestProperty("Accept", "application/octet-stream");
                if (token != null && !token.isEmpty()) {
                    conn.setRequestProperty("Authorization", "Bearer " + token);
                }
                int code = conn.getResponseCode();
                if (code != 200) {
                    if (dest.exists()) dest.delete();
                    call.reject("HTTP " + code);
                    return;
                }
                long total = conn.getContentLength(); // APK ~5 MB: int basta
                long done = 0;
                long lastEmit = 0;
                byte[] buf = new byte[65536];
                try (InputStream in = conn.getInputStream();
                     FileOutputStream out = new FileOutputStream(dest)) {
                    int n;
                    while ((n = in.read(buf)) > 0) {
                        out.write(buf, 0, n);
                        done += n;
                        // emite no máx. ~1x a cada 128 KB (evita flood de eventos)
                        if (total > 0 && done - lastEmit >= 131072) {
                            lastEmit = done;
                            JSObject p = new JSObject();
                            p.put("loaded", done);
                            p.put("total", total);
                            notifyListeners("progress", p);
                        }
                    }
                }
                JSObject res = new JSObject();
                res.put("path", dest.getAbsolutePath());
                res.put("bytes", done);
                call.resolve(res);
            } catch (Exception e) {
                if (dest.exists()) dest.delete();
                call.reject("download: " + e.getMessage());
            } finally {
                if (conn != null) conn.disconnect();
            }
        });
    }

    @PluginMethod
    public void install(PluginCall call) {
        String path = call.getString("path");
        File f = (path != null) ? new File(path) : null;
        if (f == null || !f.exists()) {
            call.reject("arquivo não encontrado");
            return;
        }

        // Android 8+: instalar apps desta fonte exige permissão especial
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !getContext().getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent settings = new Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getContext().getPackageName()));
                settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(settings);
            } catch (Exception ignored) { /* tela indisponível — o JS mostra erro */ }
            JSObject r = new JSObject();
            r.put("needsPermission", true);
            call.resolve(r);
            return;
        }

        try {
            Uri uri = FileProvider.getUriForFile(getContext(),
                    getContext().getPackageName() + ".fileprovider", f);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getContext().startActivity(intent);
            JSObject r = new JSObject();
            r.put("ok", true);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("install: " + e.getMessage());
        }
    }
}
