package com.eatsandthinks.demo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers(
                    "/api/auth/**",           // Autenticación
                    "/api/locales/**",        // Locales públicos
                    "/api/places/**",         // Places públicos
                    "/api/config/**",         // Configuración
                    "/v3/api-docs/**",        // Swagger
                    "/swagger-ui/**"          // Swagger UI
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/*/replies").permitAll()
                // Rutas que requieren autenticación
                .requestMatchers(
                    "/api/users/**",          // Usuario actual
                    "/api/favorites/**",      // Favoritos
                    "/api/reviews/**",        // Reviews (crear/editar/eliminar)
                    "/api/search-history/**", // Historial de búsquedas
                    "/api/notifications/**"   // Notificaciones
                ).authenticated()
                // Rutas solo para ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Exponer AuthenticationManager si lo necesitas para login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}