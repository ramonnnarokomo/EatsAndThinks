package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final ReviewService reviewService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, 
                         ReviewService reviewService,
                         PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.reviewService = reviewService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/users/me
     * Obtiene los datos del usuario autenticado
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
            }
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            // Obtener estadísticas del usuario
            List<ReviewService.ReviewDTO> userReviews = reviewService.getReviewsByUserId(user.getId());
            double avgRating = userReviews.isEmpty() ? 0.0 : 
                userReviews.stream().mapToInt(ReviewService.ReviewDTO::puntuacion).average().orElse(0.0);
            Map<String, Object> response = new HashMap<>();
            // Limpiar el rol (quitar prefijo ROLE_ si existe)
            String cleanRole = user.getRole().replace("ROLE_", "");
            
            response.put("id", user.getId());
            response.put("nombre", user.getNombre());
            response.put("email", user.getEmail());
            response.put("role", cleanRole);
            response.put("createdAt", user.getCreatedAt());
            response.put("totalReviews", userReviews.size());
            response.put("avgRating", avgRating);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo usuario: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error al obtener datos del usuario"));
        }
    }
    /**
     * GET /api/users/me/reviews
     * Obtiene todas las reseñas del usuario autenticado
     */
    @GetMapping("/me/reviews")
    public ResponseEntity<?> getCurrentUserReviews(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
            }
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            List<ReviewService.ReviewDTO> reviews = reviewService.getReviewsByUserId(user.getId());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo reseñas: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error al obtener reseñas"));
        }
    }

    /**
     * GET /api/users/{userId}/reviews
     * Obtiene reseñas de un usuario específico (solo para debugging o admin)
     */
    @GetMapping("/{userId}/reviews")
    public ResponseEntity<?> getUserReviewsById(@PathVariable Long userId) {
        try {
            userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            List<ReviewService.ReviewDTO> reviews = reviewService.getReviewsByUserId(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo reseñas de usuario: " + e.getMessage());
            return ResponseEntity.status(500)
                .body(Map.of("message", "Error al obtener reseñas"));
        }
    }
    /**
     * PUT /api/users/me
     * Actualiza los datos del usuario autenticado
     */
    @PutMapping("/me")
public ResponseEntity<?> updateCurrentUser(
        @RequestBody UpdateUserDTO dto,
        Authentication authentication) {
    try {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        boolean emailChanged = false;
        
        // Actualizar nombre si se proporciona
        if (dto.nombre() != null && !dto.nombre().isBlank()) {
            user.setNombre(dto.nombre());
        }
        
        // Actualizar email si se proporciona y no existe
        if (dto.email() != null && !dto.email().isBlank() && !dto.email().equals(user.getEmail())) {
            if (userRepository.findByEmail(dto.email()).isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "El email ya está en uso"));
            }
            user.setEmail(dto.email());
            emailChanged = true; // 🔥 MARCAMOS QUE EL EMAIL CAMBIÓ
        }
        
        // Actualizar contraseña si se proporciona
        if (dto.newPassword() != null && !dto.newPassword().isBlank()) {
            if (dto.currentPassword() == null || 
                !passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
                return ResponseEntity.status(400).body(Map.of("message", "Contraseña actual incorrecta"));
            }
            user.setPassword(passwordEncoder.encode(dto.newPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedUser.getId());
        response.put("nombre", updatedUser.getNombre());
        response.put("email", updatedUser.getEmail());
        response.put("message", "Perfil actualizado correctamente");
        response.put("emailChanged", emailChanged); // 🔥 AVISAMOS AL FRONTEND
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        System.err.println("❌ Error actualizando usuario: " + e.getMessage());
        return ResponseEntity.status(500)
            .body(Map.of("message", "Error al actualizar perfil"));
    }
}
    // DTO para actualización de usuario
    public record UpdateUserDTO(
        String nombre,
        String email,
        String currentPassword,
        String newPassword
    ) {}
}
