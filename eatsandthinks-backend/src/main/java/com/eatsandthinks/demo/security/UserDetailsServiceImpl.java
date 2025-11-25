package com.eatsandthinks.demo.security;

import com.eatsandthinks.demo.entity.User; // ajusta al paquete de tu entidad User
import com.eatsandthinks.demo.repository.UserRepository; // ajusta
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository; // tu repo JPA

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        
        // Verificar si el usuario está baneado
        if (user.getBanned() != null && user.getBanned()) {
            throw new UsernameNotFoundException("Usuario baneado");
        }
        
        // Spring Security requiere prefijo ROLE_ para hasAuthority()
        String authority = user.getRole();
        if (!authority.startsWith("ROLE_")) {
            authority = "ROLE_" + authority;
        }
        
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(authority) // Usar el rol con prefijo ROLE_
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
