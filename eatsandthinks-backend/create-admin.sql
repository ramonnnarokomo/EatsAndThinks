-- Script para crear usuario ADMIN
-- Primero, eliminar el admin si existe
DELETE FROM usuarios WHERE email = 'admin@gmail.com';

-- Opción 1: Crear con contraseña temporal y cambiarla luego
-- Password temporal: "admin123"
INSERT INTO usuarios (created_at, email, nombre, password, role, banned, can_review)
VALUES (
    NOW(6), 
    'admin@gmail.com', 
    'Administrator', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'ADMIN', 
    FALSE, 
    TRUE
);

-- INSTRUCCIONES:
-- 1. Ejecuta este script en PostgreSQL
-- 2. El admin se crea con password: "admin123"
-- 3. Luego usa la aplicación para cambiar la contraseña desde el perfil
-- 
-- O MEJOR: Usa el endpoint de registro para crear el usuario y luego cambia el rol:
-- 
-- 1. POST http://localhost:8080/api/auth/register
--    Body: {"nombre": "Administrator", "email": "admin@gmail.com", "password": "adminramon"}
-- 
-- 2. Luego ejecuta en PostgreSQL:
--    UPDATE usuarios SET role = 'ADMIN' WHERE email = 'admin@gmail.com';

