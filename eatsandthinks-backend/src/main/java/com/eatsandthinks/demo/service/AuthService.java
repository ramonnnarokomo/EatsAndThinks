package com.eatsandthinks.demo.service;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * REGISTRO DE USUARIO
     */
    public AuthResponse register(RegisterRequest request) {
        // 1. Verificar si el email ya existe
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("El email ya está registrado");
        }

        if (userRepository.existsByNombreIgnoreCase(request.nombre())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        if (request.recoveryPin() == null || request.recoveryPin().length() < 4 || request.recoveryPin().length() > 8) {
            throw new RuntimeException("El PIN debe tener entre 4 y 8 dígitos");
        }

        // 2. Crear el nuevo usuario
        User newUser = new User();
        newUser.setNombre(request.nombre());
        newUser.setEmail(request.email());
        // 3. Cifrar la contraseña ANTES de guardar
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setRole("USER");
        newUser.setRecoveryPin(passwordEncoder.encode(request.recoveryPin()));
        newUser.setFailedLoginAttempts(0);
        newUser.setTemporaryLock(false);

        // 4. Guardar en la BD
        newUser.setLastLoginAt(LocalDateTime.now());
        userRepository.save(newUser);

        // 5. Generar token JWT
        String token = jwtUtils.generateToken(newUser.getEmail());

        System.out.println("✅ Usuario registrado: " + request.email());
        return new AuthResponse("Registro exitoso", token, newUser.getEmail(), newUser.getRole());
    }

    public AuthResponse unlockWithPin(String email, String pin) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (user.getRecoveryPin() == null || !passwordEncoder.matches(pin, user.getRecoveryPin())) {
            throw new RuntimeException("PIN inválido");
        }
        user.setFailedLoginAttempts(0);
        user.setTemporaryLock(false);
        user.setBanned(false);
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail());
        return new AuthResponse("Cuenta desbloqueada", token, user.getEmail(), user.getRole());
    }

    /**
     * LOGIN DE USUARIO
     * NOTA: La autenticación real la hace AuthenticationManager en el Controller,
     * este método es solo si necesitas lógica adicional.
     */
    public AuthResponse login(LoginRequest request) {
        // Este método ya no es necesario porque la autenticación 
        // se maneja en el AuthController con AuthenticationManager
        // Lo dejo por compatibilidad pero no se usa
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return new AuthResponse("Login exitoso", token, user.getEmail(), user.getRole());
    }

    /**
     * CREAR SESIÓN DE INVITADO
     * Crea un usuario temporal en la BD con rol GUEST
     */
    public org.springframework.http.ResponseEntity<?> createGuestSession() {
        try {
            String guestEmail = "guest_" + System.currentTimeMillis() + "@eatsandthinks.app";
            
            // Crear usuario invitado en BD
            User guestUser = new User();
            guestUser.setNombre("Invitado");
            guestUser.setEmail(guestEmail);
            guestUser.setPassword(passwordEncoder.encode("guest_" + System.currentTimeMillis())); // Password temporal
            guestUser.setRole("GUEST");
            guestUser.setCanReview(false); // Los invitados no pueden publicar
            guestUser.setBanned(false);
            guestUser.setLastLoginAt(LocalDateTime.now());
            
            userRepository.save(guestUser);
            
            // Generar token JWT
            String jwt = jwtUtils.generateToken(guestEmail);
            
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("jwtToken", jwt);
            body.put("email", guestEmail);
            body.put("role", "GUEST");
            body.put("message", "Sesión de invitado creada");
            
            System.out.println("👤 Invitado creado en BD: " + guestEmail);
            return org.springframework.http.ResponseEntity.ok(body);
        } catch (Exception e) {
            System.err.println("❌ Error creando invitado: " + e.getMessage());
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.status(500)
                .body(java.util.Map.of("message", "Error al crear sesión de invitado"));
        }
    }

    // ========== DTOs ==========
    public record RegisterRequest(String nombre, String email, String password, String recoveryPin) {}
    public record LoginRequest(String email, String password) {}
    public record UnlockRequest(String email, String pin) {}
    public record AuthResponse(String message, String jwtToken, String email, String role) {}
}