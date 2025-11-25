-- Script de inicialización para EatsAndThinks
-- Se ejecuta automáticamente al crear el contenedor MySQL

CREATE DATABASE IF NOT EXISTS eatsandthinks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eatsandthinks;

-- Las tablas se crearán automáticamente con Hibernate (ddl-auto=update)
-- Pero podemos crear un usuario admin por defecto

-- Usuario admin por defecto (contraseña: admin123)
-- Password hash generado con BCrypt
INSERT IGNORE INTO usuarios (id, nombre, email, password, role, created_at, banned, can_review)
VALUES (
    1,
    'Administrator',
    'admin@eatsandthinks.com',
    '$2a$10$gOMY7Xdazc2eWtwf6z2VOeKeNzPnCktzWkHtNxeLA6KeMRuB8nfHK',
    'ROLE_ADMIN',
    NOW(6),
    FALSE,
    TRUE
);

