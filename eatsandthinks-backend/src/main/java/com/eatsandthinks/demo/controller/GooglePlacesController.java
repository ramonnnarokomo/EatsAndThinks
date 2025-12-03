package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.service.GooglePlacesService;
import com.eatsandthinks.demo.service.GooglePlacesService.PlaceDetails;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/places")
public class GooglePlacesController {

    private final GooglePlacesService googlePlacesService;

    public GooglePlacesController(GooglePlacesService googlePlacesService) {
        this.googlePlacesService = googlePlacesService;
    }

    /**
     * Endpoint para buscar locales usando Google Places API y aplicar filtros opcionales.
     */
    @GetMapping("/search")
    public ResponseEntity<List<GooglePlacesService.GooglePlace>> searchPlaces(
            @RequestParam String query,
            @RequestParam(required = false) Float minRating,
            @RequestParam(required = false) List<Integer> priceLevel, // Cambiar a List para múltiples valores
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) Boolean openNowOnly,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String cuisineTypes) {

        System.out.println("🔍 Búsqueda: " + query + " (Madrid)");
        System.out.println("🎯 Filtros aplicados - Rating: " + minRating + ", PriceLevels: " + priceLevel + ", OpenNowOnly: " + openNowOnly + ", CuisineTypes: " + cuisineTypes);
        
        // 1. Obtener la lista de resultados de Google Places
        List<GooglePlacesService.GooglePlace> results = googlePlacesService.searchPlaces(query);

        if (results == null || results.isEmpty()) {
            System.out.println("❌ No se encontraron resultados");
            return ResponseEntity.ok(Collections.emptyList());
        }

        System.out.println("📊 Resultados iniciales: " + results.size());

        // 2. Aplicar los filtros usando Java Streams
        Stream<GooglePlacesService.GooglePlace> filteredStream = results.stream();

        // Filtrar por Rating Mínimo
        if (minRating != null) {
            filteredStream = filteredStream.filter(place ->
                    place.getRating() != null && place.getRating() >= minRating);
            System.out.println("   - Aplicando filtro: Rating >= " + minRating);
        }

        // Filtrar por Niveles de Precio (múltiples)
        if (priceLevel != null && !priceLevel.isEmpty()) {
            filteredStream = filteredStream.filter(place ->
                    place.getPriceLevel() != null && priceLevel.contains(place.getPriceLevel()));
            System.out.println("   - Aplicando filtro: Price Levels = " + priceLevel);
        }

        // Filtrar por Abierto Ahora
        if (openNowOnly != null && openNowOnly) {
            filteredStream = filteredStream.filter(place ->
                    place.getOpenNow() != null && place.getOpenNow());
            System.out.println("   - Aplicando filtro: Abierto Ahora = true");
        }

        // Filtrar por Tipos de Cocina
        if (cuisineTypes != null && !cuisineTypes.isEmpty()) {
            List<String> selectedCuisines = Arrays.asList(cuisineTypes.split(","));
            System.out.println("   - Aplicando filtro: Tipos de Cocina = " + selectedCuisines);
            
            filteredStream = filteredStream.filter(place -> {
                if (place.getType() == null) return false;
                
                String placeType = place.getType().toLowerCase();
                return selectedCuisines.stream().anyMatch(cuisine -> {
                    String cuisineLower = cuisine.toLowerCase();
                    // Buscar coincidencias parciales en el tipo del lugar
                    return placeType.contains(cuisineLower) || 
                           cuisineLower.contains(placeType) ||
                           hasCuisineMatch(placeType, cuisineLower);
                });
            });
        }

        // Aplicar Límite de Resultados
        if (limit != null && limit > 0) {
            filteredStream = filteredStream.limit(limit);
            System.out.println("   - Aplicando filtro: Límite = " + limit);
        }

        // 3. Recolectar la lista filtrada
        List<GooglePlacesService.GooglePlace> filteredResults = filteredStream.collect(Collectors.toList());

        System.out.println("✅ Resultados filtrados: " + filteredResults.size());
        return ResponseEntity.ok(filteredResults);
    }
    /**
     * Obtiene los detalles completos de un local (de Google) por su placeId.
     * Ruta: /api/places/details/{placeId}
     */
    @GetMapping("/details/{placeId}")
    public ResponseEntity<?> getPlaceDetails(@PathVariable String placeId) {
        try {
            System.out.println("📍 [GooglePlacesController] Obteniendo detalles de: " + placeId);
            
            // Llama directamente al servicio de Google Places
            PlaceDetails details = googlePlacesService.getPlaceDetails(placeId);
            
            if (details == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No se encontró información del local en Google Places");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            // Devuelve directamente los detalles obtenidos de Google
            // (Esta ruta no interactúa con LocalRepository, a diferencia de LocalController)
            return ResponseEntity.ok(details);
            
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo detalles: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error al obtener detalles del local: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Método auxiliar para verificar coincidencias entre tipos de cocina
     */
    private boolean hasCuisineMatch(String placeType, String cuisine) {
        // Mapeo de tipos comunes para mejor matching
        Map<String, List<String>> cuisineMapping = new HashMap<>();
        cuisineMapping.put("restaurant", Arrays.asList("restaurante", "comida", "food"));
        cuisineMapping.put("cafe", Arrays.asList("café", "cafe", "coffee"));
        cuisineMapping.put("bar", Arrays.asList("bar", "pub", "cervecería"));
        cuisineMapping.put("pizza", Arrays.asList("pizzeria", "pizza", "italian"));
        cuisineMapping.put("asian", Arrays.asList("asiatico", "asiático", "chino", "japonés", "sushi", "thai"));
        cuisineMapping.put("mexican", Arrays.asList("mexicano", "mexican", "taco", "burrito"));
        cuisineMapping.put("italian", Arrays.asList("italiano", "italian", "pasta", "ristorante"));
        
        // Verificar si el tipo del lugar coincide con alguna variante de la cocina buscada
        for (Map.Entry<String, List<String>> entry : cuisineMapping.entrySet()) {
            if (entry.getValue().contains(cuisine) && placeType.contains(entry.getKey())) {
                return true;
            }
            if (entry.getValue().contains(placeType) && cuisine.contains(entry.getKey())) {
                return true;
            }
        }
        
        return false;
    }

    @GetMapping("/test")
    public String test() {
        return "✅ Google Places API funcionando";
    }
}