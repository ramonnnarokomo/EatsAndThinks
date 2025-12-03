package com.eatsandthinks.demo.controller;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.repository.LocalRepository;
import com.eatsandthinks.demo.service.GooglePlacesService;
import com.eatsandthinks.demo.service.GooglePlacesService.GooglePlace;
import com.eatsandthinks.demo.service.GooglePlacesService.PlaceDetails;

@RestController
@RequestMapping("/api/locales")
public class LocalController {

    @Autowired
    private GooglePlacesService googlePlacesService;
    
    @Autowired
    private LocalRepository localRepository;

    /**
     * Endpoint de búsqueda con filtros (limitado a Madrid)
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchLocales(
            @RequestParam String query,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) List<Integer> priceLevel, // Cambiar a List
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) Boolean openNowOnly,
            @RequestParam(required = false) String cuisineTypes) {
        try {
            System.out.println("🔍 Búsqueda: " + query + " (Madrid)");
            
            List<GooglePlace> results = googlePlacesService.searchPlaces(query);
            
            if (results == null || results.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            // Guardar en BD local (sin duplicados)
            for (GooglePlace gp : results) {
                Optional<LocalEntity> existing = localRepository.findByPlaceId(gp.placeId);
                if (existing.isEmpty()) {
                    LocalEntity local = new LocalEntity();
                    local.setPlaceId(gp.placeId);
                    local.setNombre(gp.name);
                    local.setDireccion(gp.formattedAddress);
                    local.setLatitud(gp.lat);
                    local.setLongitud(gp.lng);
                    local.setRating(gp.rating);
                    local.setTotalValoraciones(gp.userRatingsTotal);
                    local.setPrecioNivel(gp.priceLevel);
                    local.setFotoRef(gp.photoRef);
                    local.setTipo(gp.type);
                    local.setAbierto(gp.openNow);
                    local.setSource(LocalEntity.Source.GOOGLE);
                    localRepository.save(local);
                }
            }

            // Aplicar filtros
            List<GooglePlace> filtered = results.stream()
                .filter(p -> minRating == null || (p.getRating() != null && p.getRating() >= minRating))
                .filter(p -> priceLevel == null || priceLevel.isEmpty() || (p.getPriceLevel() != null && priceLevel.contains(p.getPriceLevel())))
                .filter(p -> openNowOnly == null || !openNowOnly || (p.getOpenNow() != null && p.getOpenNow()))
                .collect(Collectors.toList());

            return ResponseEntity.ok(filtered);
            
        } catch (Exception e) {
            System.err.println("❌ Error en búsqueda: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al buscar lugares: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtiene todos los locales guardados en la BD
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllLocales() {
        try {
            List<LocalEntity> locales = localRepository.findAll();
            List<Map<String, Object>> response = locales.stream()
                .map(this::entityToMap)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo locales: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    /**
     * GET /api/locales/community
     * Obtiene solo los locales creados por administradores
     */
    @GetMapping("/community")
    public ResponseEntity<List<Map<String, Object>>> getCommunityLocales() {
        try {
            List<LocalEntity> communityLocales = localRepository.findBySource(LocalEntity.Source.LOCAL);
            List<Map<String, Object>> response = communityLocales.stream()
                .map(this::entityToMap)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo locales de comunidad: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    /**
     * Obtiene detalles completos de un local por placeId
     * Incluye información extendida y reseñas de Google
     */
    
    @GetMapping("/details/{placeId}")
    public ResponseEntity<?> getLocalDetails(@PathVariable String placeId) {
        try {
            System.out.println("📍 Obteniendo detalles de: " + placeId);
            
            // Primero buscar en BD local
            Optional<LocalEntity> localOpt = localRepository.findByPlaceId(placeId);
            
            // Obtener detalles completos de Google Places API
            PlaceDetails details = googlePlacesService.getPlaceDetails(placeId);
            
            if (details == null) {
                // Si no hay detalles de Google, devolver lo que tengamos en BD
                if (localOpt.isPresent()) {
                    return ResponseEntity.ok(entityToMap(localOpt.get()));
                }
                
                Map<String, String> error = new HashMap<>();
                error.put("message", "No se encontró información del local");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Actualizar o crear en BD
            LocalEntity local;
            if (localOpt.isPresent()) {
                local = localOpt.get();
            } else {
                local = new LocalEntity();
                local.setPlaceId(placeId);
                local.setSource(LocalEntity.Source.GOOGLE);
            }
            
            // Actualizar con datos de Google
            local.setNombre(details.name);
            local.setDireccion(details.formattedAddress);
            local.setLatitud(details.lat);
            local.setLongitud(details.lng);
            local.setRating(details.rating);
            local.setTotalValoraciones(details.userRatingsTotal);
            local.setPrecioNivel(details.priceLevel);
            local.setFotoRef(details.photoRef);
            local.setTipo(details.type);
            local.setAbierto(details.openNow);
            
            localRepository.save(local);
            
            // Crear respuesta con detalles completos
            Map<String, Object> response = new HashMap<>();
            response.put("id", local.getId());
            response.put("placeId", details.placeId);
            response.put("name", details.name);
            response.put("formattedAddress", details.formattedAddress);
            response.put("lat", details.lat);
            response.put("lng", details.lng);
            response.put("rating", details.rating);
            response.put("userRatingsTotal", details.userRatingsTotal);
            response.put("priceLevel", details.priceLevel);
            response.put("photoRef", details.photoRef);
            response.put("type", details.type);
            response.put("openNow", details.openNow);
            response.put("phoneNumber", details.phoneNumber);
            response.put("website", details.website);
            response.put("openingHours", details.openingHours);
            
            // Añadir reseñas de Google
            if (details.reviews != null && !details.reviews.isEmpty()) {
                response.put("googleReviews", details.reviews);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo detalles: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener detalles del local: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Convierte LocalEntity a Map para la respuesta JSON
     */
    private Map<String, Object> entityToMap(LocalEntity entity) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", entity.getId());
        map.put("placeId", entity.getPlaceId());
        map.put("name", entity.getNombre());
        map.put("formattedAddress", entity.getDireccion());
        map.put("lat", entity.getLatitud());
        map.put("lng", entity.getLongitud());
        map.put("rating", entity.getRating());
        map.put("userRatingsTotal", entity.getTotalValoraciones());
        map.put("priceLevel", entity.getPrecioNivel());
        map.put("photoRef", entity.getFotoRef());
        map.put("type", entity.getTipo());
        map.put("openNow", entity.getAbierto());
        return map;
    }
}