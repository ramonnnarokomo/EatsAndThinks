package com.eatsandthinks.demo.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "http://localhost:3000")
public class ConfigController {

    @Autowired
    private Environment env;

    /**
     * Endpoint para obtener la API key de Google
     * El frontend la necesita para mostrar mapas y fotos
     */
    @GetMapping("/google-api-key")
    public ResponseEntity<Map<String, String>> getGoogleApiKey() {
        Map<String, String> response = new HashMap<>();
        String apiKey = env.getProperty("google.places.api.key");
        
        if (apiKey != null && !apiKey.isEmpty()) {
            response.put("apiKey", apiKey);
            System.out.println("✅ API Key enviada al frontend");
        } else {
            response.put("apiKey", "");
            System.out.println("⚠️ API Key no configurada");
        }
        
        return ResponseEntity.ok(response);
    }
}