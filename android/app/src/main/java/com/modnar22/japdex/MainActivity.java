package com.modnar22.japdex;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin "Updater" (v4.12): download + instalação da atualização
        // dentro do app. Precisa ser registrado ANTES de super.onCreate.
        registerPlugin(UpdaterPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
