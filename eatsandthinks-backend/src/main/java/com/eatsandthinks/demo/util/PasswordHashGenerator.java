package com.eatsandthinks.demo.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Genera el hash BCrypt de una contraseña para crear un usuario a mano en la base de datos.
 * La contraseña se pasa como argumento, para no dejarla escrita en el código.
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length != 1 || args[0].isBlank()) {
            System.err.println("Uso: PasswordHashGenerator <password>");
            System.exit(1);
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode(args[0]);

        System.out.println("===============================================");
        System.out.println("Hashed Password:");
        System.out.println(hashedPassword);
        System.out.println("===============================================");
        System.out.println("\nSQL Query:");
        System.out.println("INSERT INTO usuarios (created_at, email, nombre, password, role, banned, can_review)");
        System.out.println("VALUES (NOW(6), 'admin@gmail.com', 'ADMIN', '" + hashedPassword + "', 'ADMIN', FALSE, TRUE);");
        System.out.println("===============================================");
    }
}
