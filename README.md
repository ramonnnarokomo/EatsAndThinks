# 🍽️ EatsAndThinks

> Descubre los mejores restaurantes y lugares para comer en Madrid

Una aplicación web moderna para buscar, valorar y descubrir restaurantes, con sistema de reseñas, favoritos y gestión administrativa.

---

## ✨ Características

- 🔍 **Búsqueda Avanzada:** Filtra por tipo de cocina, precio, rating y más
- ⭐ **Sistema de Reseñas:** Comparte tus experiencias gastronómicas
- ❤️ **Favoritos:** Guarda tus lugares preferidos
- 📍 **Mapas Integrados:** Visualiza la ubicación exacta de cada local
- 🔐 **3 Tipos de Usuario:** Invitado, Usuario Registrado, Admin
- 📱 **PWA:** Instalable como aplicación de escritorio
- 🌐 **Multilingüe:** Interfaz en español
- 🎨 **UI Moderna:** Diseño glassmorphism con Tailwind CSS

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

**Windows:**
1. Instala [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Doble click en `start-docker.bat`
3. Espera ~2 minutos (primera vez)
4. Abre http://localhost

**Mac/Linux:**
```bash
docker-compose up --build
```

### Opción 2: Desarrollo Local

**Backend:**
```bash
cd eatsandthinks-backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd "EatsAndThinks Web Prototype"
npm install
npm run dev
```

---

## 📦 Tecnologías

### Frontend
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + Shadcn/ui
- 🔄 Axios para API calls
- 🎯 React Context para estado global
- 📱 Vite + PWA Plugin
- 🍞 React Toastify para notificaciones

### Backend
- ☕ Spring Boot 3.x
- 🔐 Spring Security + JWT
- 🗄️ MySQL + JPA/Hibernate
- 🌍 Google Places API integration
- 📊 RESTful API

### DevOps
- 🐳 Docker + Docker Compose
- 📦 Multi-stage builds optimizados
- 🚀 Nginx para servir frontend

---

## 👥 Tipos de Usuario

### 🔓 Invitado
- ✅ Ver locales y reseñas
- ❌ No puede publicar reseñas
- ❌ No tiene favoritos

### 👤 Usuario Registrado
- ✅ Todo lo de invitado +
- ✅ Publicar reseñas
- ✅ Guardar favoritos
- ✅ Perfil personalizado

### 👑 Administrador
- ✅ Todo lo de usuario registrado +
- ✅ Crear locales de la comunidad
- ✅ Gestionar usuarios (roles, permisos, baneo)
- ✅ Eliminar reseñas inapropiadas
- ✅ Ver estadísticas del sistema

**Credenciales de prueba:**
- Admin: `admin@eatsandthinks.com` / `admin123`

---

## 📖 Documentación

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de despliegue (PWA + Docker)
- **[generate-icons.html](./EatsAndThinks%20Web%20Prototype/generate-icons.html)** - Generador de iconos PWA

---

## 🎯 Estructura del Proyecto

```
EathsAndThinks_Project/
├── eatsandthinks-backend/          # Backend Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/               # Código Java
│   │       └── resources/          # Configuración
│   ├── Dockerfile
│   └── pom.xml
│
├── EatsAndThinks Web Prototype/    # Frontend React
│   ├── src/
│   │   ├── components/             # Componentes React
│   │   ├── services/               # API calls
│   │   ├── context/                # Estado global
│   │   └── utils/                  # Utilidades
│   ├── public/                     # Archivos estáticos
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
│
├── docker-compose.yml              # Orquestación Docker
├── init-db.sql                     # Init script MySQL
├── start-docker.bat                # Script Windows
└── stop-docker.bat                 # Script Windows
```

---

## 🛠️ Comandos Útiles

### Docker
```bash
# Iniciar todo
docker-compose up --build

# Detener
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar desde cero
docker-compose down -v && docker-compose up --build
```

### Desarrollo
```bash
# Construir PWA
cd "EatsAndThinks Web Prototype"
npm run build

# Preview PWA
npm run preview

# Backend con hot reload
cd eatsandthinks-backend
./mvnw spring-boot:run
```

---

## 🌐 Despliegue en Producción

### Frontend (Vercel)
```bash
npm install -g vercel
cd "EatsAndThinks Web Prototype"
vercel --prod
```

### Backend + MySQL (Railway)
1. [railway.app](https://railway.app) → New Project
2. Deploy from GitHub
3. Add MySQL database
4. Configura variables de entorno

---

## 🔒 Variables de Entorno

Crea `.env` en la raíz:

```env
GOOGLE_PLACES_API_KEY=tu_api_key
MYSQL_ROOT_PASSWORD=tu_password
MYSQL_DATABASE=eatsandthinks
```

---

## 🐛 Solución de Problemas

### Puerto ocupado
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "8081:80"  # Usar 8081 en lugar de 80
```

### MySQL no conecta
```bash
# Esperar a que inicie
docker-compose logs mysql

# Verificar salud
docker inspect eatsandthinks-mysql
```

### Reinstalar dependencias
```bash
cd "EatsAndThinks Web Prototype"
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Licencia

Este proyecto es de código abierto para fines educativos.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🎉 ¡Disfruta EatsAndThinks!

**Desarrollado con ❤️ y mucho ☕**

Para soporte o preguntas, abre un issue en GitHub.

