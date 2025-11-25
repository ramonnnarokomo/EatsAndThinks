package com.eatsandthinks.demo.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "adminramon";
        String hashedPassword = encoder.encode(password);
        
        System.out.println("===============================================");
        System.out.println("Password: " + password);
        System.out.println("Hashed Password:");
        System.out.println(hashedPassword);
        System.out.println("===============================================");
        System.out.println("\nSQL Query:");
        System.out.println("INSERT INTO usuarios (created_at, email, nombre, password, role, banned, can_review)");
        System.out.println("VALUES (NOW(6), 'admin@gmail.com', 'ADMIN', '" + hashedPassword + "', 'ADMIN', FALSE, TRUE);");
        System.out.println("===============================================");
    }
}

