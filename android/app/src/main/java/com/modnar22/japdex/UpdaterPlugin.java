package com.modnar22.japdex;

import android.app.DownloadManager;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * v4.12.1 — Atualização no Android: baixa DENTRO do app (com barra de
 * progresso), mas a INSTALAÇÃO fica por conta do DownloadManager do sistema
 * — o usuário toca na notificação "Download concluído" e o instalador padrão
 * do Android assume, exatamente como ao baixar um APK no navegador.
 *
 * Por que assim (a v4.12.0 fazia download + instalação no próprio app):
 * permissão REQUEST_INSTALL_PACKAGES + código que abre instaladores é um
 * padrão que o Play Protect associa a malware e marcava o APK como
 * "potencialmente perigoso". Usar o DownloadManager devolve o fluxo ao
 * sistema e tira esses sinais do nosso APK.
 *
 * O DownloadManager não notifica progresso em tempo real, então consultamos
 * o cursor dele a cada 400 ms e emitimos o evento "progress" {loaded,total}.
 */
@CapacitorPlugin(name = "Updater")
public class UpdaterPlugin extends Plugin {

    private long lastDownloadId = -1;

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName");
        String token = call.getString("token");

        // Só endpoints da API do GitHub (mesma regra do Electron)
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

        DownloadManager dm = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
        if (dm == null) {
            call.reject("DownloadManager indisponível");
            return;
        }
        // Diretório externo do próprio app (padrão do DownloadManager —
        // não exige NENHUMA permissão de armazenamento)
        File dir = getContext().getExternalFilesDir(null);
        if (dir == null) {
            call.reject("armazenamento externo indisponível");
            return;
        }

        try {
            // Evita acumular downloads duplicados
            if (lastDownloadId != -1) {
                try { dm.remove(lastDownloadId); } catch (Exception ignored) { /* ignore */ }
                lastDownloadId = -1;
            }
            File dest = new File(dir, safeName);
            if (dest.exists()) dest.delete();

            DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
            req.setMimeType("application/vnd.android.package-archive");
            req.addRequestHeader("User-Agent", "Jap-Dex-Updater");
            req.addRequestHeader("Accept", "application/octet-stream");
            if (token != null && !token.isEmpty()) {
                req.addRequestHeader("Authorization", "Bearer " + token);
            }
            req.setTitle("Atualização do Jap-Dex");
            req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            req.setAllowedOverRoaming(true);
            req.setDestinationUri(Uri.fromFile(dest));

            long id = dm.enqueue(req);
            lastDownloadId = id;
            poll(dm, id, call);
        } catch (Exception e) {
            call.reject("download: " + e.getMessage());
        }
    }

    /* Acompanha o download e emite "progress" {loaded,total} a cada ~400 ms.
       Resolve em STATUS_SUCCESSFUL / rejeita em STATUS_FAILED. Um executor
       por download: é encerrado junto com o estado terminal. */
    private void poll(final DownloadManager dm, final long id, final PluginCall call) {
        final ScheduledExecutorService exec = Executors.newSingleThreadScheduledExecutor();
        exec.scheduleWithFixedDelay(() -> {
            Cursor c = null;
            try {
                c = dm.query(new DownloadManager.Query().setFilterById(id));
                if (c == null || !c.moveToFirst()) {
                    exec.shutdown();
                    call.reject("download não encontrado");
                    return;
                }
                int status = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                long done = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
                long total = c.getLong(c.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));

                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    JSObject res = new JSObject();
                    res.put("bytes", total > 0 ? total : done);
                    String local = c.getString(c.getColumnIndexOrThrow(DownloadManager.COLUMN_LOCAL_URI));
                    res.put("path", local != null ? Uri.parse(local).getPath() : "");
                    JSObject p = new JSObject();
                    p.put("loaded", res.getLong("bytes"));
                    p.put("total", res.getLong("bytes"));
                    notifyListeners("progress", p);
                    exec.shutdown();
                    call.resolve(res);
                    return;
                }
                if (status == DownloadManager.STATUS_FAILED) {
                    int reason = c.getInt(c.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON));
                    exec.shutdown();
                    call.reject(failMessage(reason));
                    return;
                }
                if (total > 0) {
                    JSObject p = new JSObject();
                    p.put("loaded", done);
                    p.put("total", total);
                    notifyListeners("progress", p);
                }
            } catch (Exception e) {
                exec.shutdown();
                call.reject("download: " + e.getMessage());
            } finally {
                if (c != null) c.close();
            }
        }, 0, 400, TimeUnit.MILLISECONDS);
    }

    private static String failMessage(int reason) {
        switch (reason) {
            case DownloadManager.ERROR_HTTP_DATA_ERROR: return "falha HTTP no download";
            case DownloadManager.ERROR_INSUFFICIENT_SPACE: return "sem espaço em armazenamento";
            case DownloadManager.ERROR_DEVICE_NOT_FOUND: return "armazenamento indisponível";
            case DownloadManager.ERROR_CANNOT_RESUME: return "download não pôde ser retomado";
            case DownloadManager.ERROR_FILE_ERROR: return "erro de arquivo no download";
            default: return "falha no download (código " + reason + ")";
        }
    }
}
