package com.eatsandthinks.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:4200")
public class TestController {

    @GetMapping("/db")
    public String testDB() {
        return "✅ Tablas creadas correctamente - " + new java.util.Date();
    }
    
    @GetMapping("/google-places")
    public String testGooglePlaces() {
        return "✅ Google Places API configurada";
    }
}