package com.eatsandthinks.demo.controller;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.service.AuthService;
import com.eatsandthinks.demo.service.AuthService.LoginRequest;
import com.eatsandthinks.demo.service.AuthService.RegisterRequest;
import com.eatsandthinks.demo.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
                          AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserRepository userRepository) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication.getName());

        Map<String, String> body = new HashMap<>();
        body.put("jwtToken", jwt);
        body.put("message", "OK");
        return ResponseEntity.ok(body);
    }

    /**
     * POST /api/auth/guest
     * Crea una sesión de invitado (sin registro)
     */
    @PostMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        return authService.createGuestSession();
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
