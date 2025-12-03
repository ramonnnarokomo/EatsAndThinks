package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.entity.SearchHistory;
import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.SearchHistoryRepository;
import com.eatsandthinks.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search-history")
public class SearchHistoryController {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/search-history
     * Guarda una búsqueda en el historial del usuario autenticado
     */
    @PostMapping
    public ResponseEntity<?> saveSearch(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            String searchTerm = body.get("searchTerm");
            if (searchTerm == null || searchTerm.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("message", "El término de búsqueda no puede estar vacío"));
            }

            // Guardar en el historial
            SearchHistory history = new SearchHistory(user.getId(), searchTerm.trim());
            searchHistoryRepository.save(history);

            return ResponseEntity.ok(Map.of("message", "Búsqueda guardada"));
        } catch (Exception e) {
            System.err.println("❌ Error guardando búsqueda: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al guardar búsqueda"));
        }
    }

    /**
     * GET /api/search-history
     * Obtiene las últimas 10 búsquedas únicas del usuario autenticado
     */
    @GetMapping
    public ResponseEntity<?> getSearchHistory(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Obtener las últimas 10 búsquedas únicas
            List<String> recentSearches = searchHistoryRepository.findDistinctSearchTermsByUserId(user.getId());
            
            // Limitar a las últimas 10
            if (recentSearches.size() > 10) {
                recentSearches = recentSearches.subList(0, 10);
            }
            
            return ResponseEntity.ok(recentSearches);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo historial: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener historial"));
        }
    }

    /**
     * DELETE /api/search-history
     * Elimina todo el historial de búsquedas del usuario autenticado
     */
    @DeleteMapping
    public ResponseEntity<?> clearSearchHistory(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            List<SearchHistory> userHistory = searchHistoryRepository.findByUserIdOrderBySearchDateDesc(user.getId());
            searchHistoryRepository.deleteAll(userHistory);

            return ResponseEntity.ok(Map.of("message", "Historial eliminado"));
        } catch (Exception e) {
            System.err.println("❌ Error eliminando historial: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al eliminar historial"));
        }
    }
}

