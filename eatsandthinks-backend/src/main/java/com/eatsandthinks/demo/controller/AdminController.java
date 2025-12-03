package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.LocalRepository;
import com.eatsandthinks.demo.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {

    private final UserRepository userRepository;
    private final LocalRepository localRepository;

    public AdminController(UserRepository userRepository, LocalRepository localRepository) {
        this.userRepository = userRepository;
        this.localRepository = localRepository;
    }

    /**
     * Verifica que el usuario autenticado es ADMIN
     */
    private User validateAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No autenticado");
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Comparar con ADMIN o ROLE_ADMIN
        if (!"ADMIN".equals(user.getRole()) && !"ROLE_ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Acceso denegado: se requieren permisos de administrador");
        }
        return user;
    }

    private boolean isAdminRole(String role) {
        return "ADMIN".equalsIgnoreCase(role) || "ROLE_ADMIN".equalsIgnoreCase(role);
    }

    private boolean isOtherAdmin(User actingAdmin, User target) {
        if (actingAdmin == null || target == null) {
            return false;
        }
        if (isSuperAdmin(actingAdmin)) {
            return false;
        }
        return !actingAdmin.getId().equals(target.getId()) && isAdminRole(target.getRole());
    }

    private boolean isSuperAdmin(User user) {
        if (user == null) {
            return false;
        }
        return "Administrator".equalsIgnoreCase(user.getNombre()) ||
               "admin@gmail.com".equalsIgnoreCase(user.getEmail());
    }

    /**
     * GET /api/admin/users
     * Lista todos los usuarios (solo ADMIN)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        try {
            validateAdmin(authentication);
            List<User> users = userRepository.findAll();
            
            List<Map<String, Object>> usersData = users.stream()
                .map(u -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", u.getId());
                    data.put("nombre", u.getNombre());
                    data.put("email", u.getEmail());
                    data.put("role", u.getRole());
                    data.put("banned", u.getBanned());
                    data.put("canReview", u.getCanReview());
                    data.put("createdAt", u.getCreatedAt());
                    data.put("lastLoginAt", u.getLastLoginAt());
                    return data;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(usersData);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo usuarios: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener usuarios"));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/role
     * Cambia el rol de un usuario
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> changeUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            User admin = validateAdmin(authentication);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (isOtherAdmin(admin, user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No puedes modificar el rol de otro administrador"));
            }
            
            // Proteger al usuario "Administrator" de cambios de rol por otros admins
            if (!isSuperAdmin(admin) && isSuperAdmin(user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No se puede cambiar el rol del usuario Administrator"));
            }
            
            String newRole = body.get("role");
            
            // Normalizar el rol recibido (puede venir ADMIN o ROLE_ADMIN)
            if (newRole.startsWith("ROLE_")) {
                newRole = newRole.substring(5); // Quitar el prefijo ROLE_
            }
            
            if (!List.of("ADMIN", "USER", "GUEST").contains(newRole)) {
                return ResponseEntity.status(400).body(Map.of("message", "Rol inválido: " + newRole));
            }
            
            user.setRole(newRole);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Rol actualizado correctamente", "newRole", newRole));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error cambiando rol: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al cambiar rol"));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/ban
     * Banea o desbanea un usuario
     */
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> toggleBanUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication) {
        try {
            User admin = validateAdmin(authentication);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (isOtherAdmin(admin, user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No puedes banear a otro administrador"));
            }
            
            // Proteger al usuario "Administrator" de ser baneado por otros admins
            if (!isSuperAdmin(admin) && isSuperAdmin(user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No se puede banear al usuario Administrator"));
            }
            
            Boolean banned = body.get("banned");
            
            user.setBanned(banned);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", banned ? "Usuario baneado" : "Usuario desbaneado"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error baneando usuario: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al banear usuario"));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/review-permission
     * Permite o prohíbe a un usuario publicar reseñas
     */
    @PutMapping("/users/{userId}/review-permission")
    public ResponseEntity<?> toggleReviewPermission(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication) {
        try {
            User admin = validateAdmin(authentication);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (isOtherAdmin(admin, user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No puedes modificar los permisos de reseña de otro administrador"));
            }
            
            // Proteger al usuario "Administrator" de cambios en permisos por otros admins
            if (!isSuperAdmin(admin) && isSuperAdmin(user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No se pueden modificar los permisos del usuario Administrator"));
            }
            
            Boolean canReview = body.get("canReview");
            
            user.setCanReview(canReview);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", canReview 
                ? "Usuario puede publicar reseñas" 
                : "Usuario no puede publicar reseñas"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error cambiando permisos: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al cambiar permisos"));
        }
    }

    /**
     * DELETE /api/admin/users/{userId}
     * Elimina un usuario (solo ADMIN)
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            User admin = validateAdmin(authentication);
            
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (isOtherAdmin(admin, user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No puedes eliminar a otro administrador"));
            }
            
            // Proteger al usuario "Administrator" de ser eliminado por otros admins
            if (!isSuperAdmin(admin) && isSuperAdmin(user)) {
                return ResponseEntity.status(403).body(Map.of("message", "❌ No se puede eliminar al usuario Administrator"));
            }
            
            // No permitir que un admin se elimine a sí mismo
            if (admin.getId().equals(userId)) {
                return ResponseEntity.status(400).body(Map.of("message", "No puedes eliminarte a ti mismo"));
            }
            
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Usuario eliminado correctamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error eliminando usuario: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al eliminar usuario"));
        }
    }

    /**
     * POST /api/admin/locals
     * Crea un local manualmente (solo ADMIN)
     */
    @PostMapping("/locals")
    public ResponseEntity<?> createLocal(
            @RequestBody CreateLocalDTO dto,
            Authentication authentication) {
        try {
            User admin = validateAdmin(authentication);
            
            // Generar placeId único si no se proporciona
            String placeId = dto.placeId();
            if (placeId == null || placeId.isBlank()) {
                placeId = "LOCAL_" + System.currentTimeMillis() + "_" + admin.getId();
            }
            
            // Verificar que no exista ya el placeId
            if (localRepository.findByPlaceId(placeId).isPresent()) {
                return ResponseEntity.status(400).body(Map.of("message", "El local ya existe"));
            }
            
            LocalEntity local = new LocalEntity();
            local.setPlaceId(placeId);
            local.setNombre(dto.nombre());
            local.setDireccion(dto.direccion());
            local.setTipo(dto.tipo());
            local.setLatitud(dto.lat());
            local.setLongitud(dto.lng());
            local.setPrecioNivel(dto.priceLevel());
            local.setFotoRef(dto.photoRef());
            local.setSource(LocalEntity.Source.LOCAL);
            local.setCreadoPorUsuarioId(admin.getId());
            
            // Campos opcionales
            if (dto.rating() != null && dto.rating() > 0) {
                local.setRating(dto.rating());
                local.setTotalValoraciones(0); // 0 indica que es rating del creador
            }
            
            LocalEntity saved = localRepository.save(local);
            
            System.out.println("✅ Local creado por ADMIN: " + saved.getNombre() + " (PlaceId: " + saved.getPlaceId() + ")");
            return ResponseEntity.status(201).body(Map.of(
                "message", "Local creado correctamente",
                "localId", saved.getId(),
                "placeId", saved.getPlaceId()
            ));
        } catch (RuntimeException e) {
            System.err.println("❌ RuntimeException creando local: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error creando local: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al crear local: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/stats
     * Estadísticas generales del sistema
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats(Authentication authentication) {
        try {
            validateAdmin(authentication);
            
            long totalUsers = userRepository.count();
            long totalLocals = localRepository.count();
            long adminCount = userRepository.findAll().stream().filter(u -> "ADMIN".equals(u.getRole())).count();
            long bannedCount = userRepository.findAll().stream().filter(User::getBanned).count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("totalLocals", totalLocals);
            stats.put("adminCount", adminCount);
            stats.put("bannedUsers", bannedCount);
            
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo estadísticas: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener estadísticas"));
        }
    }

    /**
     * GET /api/admin/reviews
     * Obtiene todas las reseñas del sistema
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews(Authentication authentication) {
        try {
            validateAdmin(authentication);
            // Por ahora retornamos lista vacía, implementar si necesitas
            return ResponseEntity.ok(java.util.List.of());
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al obtener reseñas"));
        }
    }

    // DTOs
    public record CreateLocalDTO(
        String placeId,
        String nombre,
        String direccion,
        String tipo,
        Double lat,
        Double lng,
        Integer priceLevel,
        String photoRef,
        String descripcion,
        String telefono,
        String website,
        String horario,
        Double rating
    ) {}
}

