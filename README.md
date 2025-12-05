# 🍽️ EatsAndThinks

> Descubre los mejores restaurantes y lugares para comer en Madrid
>
> URL PARA USARLA CON SOLO HACER CLICK -> https://eats-and-thinks-web-prototype.vercel.app/

Portal web/PWA para explorar restaurantes, guardar favoritos, seguir notificaciones y administrar contenido con foco móvil (infinite scroll, historial inteligente, badges centrados).

---

## ✨ Novedades

- Botones “Visitar web” y “Cómo llegar” siempre visibles en desktop, con respaldo a Google Maps.
- Respuestas de reseñas se cargan de 4 en 4 y ofrecen “Mostrar más”.
- Panel de notificaciones con scroll interno, límite inicial de 4 items y badge rojo consistente en sidebar/campana.
- Sidebar desktop colapsable/minimizable con peek táctil y logout convertido en círculo rojo cuando está cerrado.
- Navegación móvil: Search/Favorites/Profile se despliegan desde arriba y el back button sigue el flujo esperado (última pantalla, Home, salir).
- Home conserva la posición del infinite scroll y el overlay al volver desde RestaurantDetailScreen.
- Login/Register admiten PIN numérico de recuperación y desbloqueo con el mismo flujo.
- Admin Panel muestra «Último acceso» para cualquier superadmin y permite eliminar locales comunitarios.
- Nueva documentación: `MAPA_TRAZABILIDAD.md` y `src/services/ApiExamples.ts` describen trazabilidad y ejemplos de APIs.

---

## 🚀 Arranque rápido

**Docker (recomendado)**

```bash
# Windows: doble click en start-docker.bat
de start-docker.bat

# Mac/Linux
docker-compose up --build
```

**Desarrollo local**

```bash
cd eatsandthinks-backend
./mvnw spring-boot:run

cd "../EatsAndThinks Web Prototype"
npm install
npm run dev
```

---

## 🧰 Stack principal

### Frontend
- React 18 + TypeScript (Vite + plugin PWA)
- Tailwind CSS + Shadcn/ui + toastify
- Axios con interceptores, contextos globales y navegación hash con scroll-restoration

### Backend
- Spring Boot 3 + Spring Security con JWT
- MySQL/JPA, servicios `Review`, `Users`, `Places`, `Traceability`
- Google Places API para fotos, detalles y direcciones

### Infraestructura
- Docker Compose + multi-stage builds
- Nginx como proxy en producción
- Vercel (frontend) y Railway (backend/MySQL)

---

## 📚 Documentación útil

- `DEPLOYMENT.md` → despliegue PWA + Docker
- `MAPA_TRAZABILIDAD.md` → arquitectura, servicios y trazabilidad completa
- `src/services/ApiExamples.ts` → ejemplos de peticiones, retries y manejo de errores HTTP
- `generate-icons.html` → generador de iconos PWA

---

## 🧱 Estructura resumida

```
eatsandthinks-backend/          # REST + seguridad + servicios
EatsAndThinks Web Prototype/    # UI, componentes, contextos, servicios y estilos
docker-compose.yml             # Orquestación (frontend, backend, MySQL)
start-docker.bat / stop-docker.bat
init-db.sql                    # Seed SQL
```

---

## ⚙️ Comandos frecuentes

```bash
# Levantar stack
docker-compose up --build

# Parar
docker-compose down

# Logs
docker-compose logs -f

# Rebuild completo
docker-compose down -v && docker-compose up --build

# Frontend
npm run dev
npm run build
npm run preview

# Backend
cd eatsandthinks-backend
./mvnw spring-boot:run
```

---

## 🚢 Despliegue

### Frontend (Vercel)

```bash
npm install -g vercel
cd "EatsAndThinks Web Prototype"
vercel --prod
```

### Backend + MySQL (Railway)

1. Crear proyecto en [railway.app](https://railway.app)
2. Desplegar desde GitHub
3. Añadir base de datos MySQL
4. Configurar variables de entorno

---

## 🔐 Variables de entorno

```env
GOOGLE_PLACES_API_KEY=tu_api_key
MYSQL_ROOT_PASSWORD=secreto
MYSQL_DATABASE=eatsandthinks
```

---

## 🐞 Atajos de troubleshooting

- Cambia puertos en `docker-compose.yml` si están ocupados (`ports: - "8081:80"`).
- Usa `docker-compose logs mysql` y `docker inspect eatsandthinks-mysql` para monitorear MySQL.
- Para reinstalar dependencias:

```bash
cd "EatsAndThinks Web Prototype"
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contribuir

1. Fork → `git checkout -b feature/nombre`
2. Commit descriptivo
3. Push y abrir PR

---

## 🎉 ¡Disfruta EatsAndThinks!

Desarrollado con ❤️ y ☕

