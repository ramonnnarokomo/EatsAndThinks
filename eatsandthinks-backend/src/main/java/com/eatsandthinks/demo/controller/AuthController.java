package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.service.AuthService;
import com.eatsandthinks.demo.service.AuthService.LoginRequest;
import com.eatsandthinks.demo.service.AuthService.RegisterRequest;
import com.eatsandthinks.demo.service.AuthService.UnlockRequest;
import com.eatsandthinks.demo.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int MAX_LOGIN_ATTEMPTS = 3;

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService,
                          AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * POST /api/auth/register
     * Registra un nuevo usuario en la base de datos.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        var response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Autentica un usuario y devuelve un JWT válido.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas"));
        }

        if (Boolean.TRUE.equals(user.getBanned())) {
            return ResponseEntity.status(403).body(Map.of("message", "Cuenta bloqueada. Contacta con soporte."));
        }

        if (Boolean.TRUE.equals(user.getTemporaryLock())) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Cuenta bloqueada temporalmente. Usa tu PIN de recuperación para desbloquearla.",
                "locked", true
            ));
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return failedLoginResponse(user);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            user.setFailedLoginAttempts(0);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String jwt = jwtUtils.generateToken(authentication.getName());
            Map<String, Object> body = new HashMap<>();
            body.put("jwtToken", jwt);
            body.put("message", "OK");
            return ResponseEntity.ok(body);
        } catch (AuthenticationException e) {
            return failedLoginResponse(user);
        }
    }

    private ResponseEntity<?> failedLoginResponse(User user) {
        Integer attempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
        attempts++;
        user.setFailedLoginAttempts(attempts);
        boolean locked = attempts >= MAX_LOGIN_ATTEMPTS;
        if (locked) {
            user.setTemporaryLock(true);
        }
        userRepository.save(user);
        int remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
        String message = locked
            ? "Tu cuenta ha sido bloqueada por múltiples intentos fallidos."
            : "Credenciales incorrectas. Intentos restantes: " + remaining;
        return ResponseEntity.status(locked ? 403 : 401).body(Map.of(
            "message", message,
            "attemptsLeft", remaining,
            "locked", locked
        ));
    }

    /**
     * POST /api/auth/guest
     * Crea una sesión de invitado (sin registro)
     */
    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        return authService.createGuestSession();
    }

    @PostMapping("/unlock")
    public ResponseEntity<?> unlockAccount(@RequestBody UnlockRequest request) {
        try {
            var response = authService.unlockWithPin(request.email(), request.pin());
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    /**
     * POST /api/auth/logout
     * Cierra sesión y elimina usuario invitado si aplica
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        try {
            if (authentication != null && authentication.isAuthenticated()) {
                String email = authentication.getName();
                
                // Si es invitado, eliminarlo de la BD
                if (email.startsWith("guest_")) {
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null && "GUEST".equals(user.getRole())) {
                        userRepository.delete(user);
                        System.out.println("🗑️ Usuario invitado eliminado de BD: " + email);
                    }
                }
            }
            
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(Map.of("message", "Sesión cerrada correctamente"));
        } catch (Exception e) {
            System.err.println("❌ Error en logout: " + e.getMessage());
            return ResponseEntity.ok(Map.of("message", "Sesión cerrada"));
        }
    }
}
