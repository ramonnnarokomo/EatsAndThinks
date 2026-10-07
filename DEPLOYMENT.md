# 📦 EatsAndThinks - Guía de Despliegue

Este documento explica cómo ejecutar, empaquetar y desplegar la aplicación EatsAndThinks.

---

## 🚀 OPCIÓN A: PWA (Progressive Web App)

### ¿Qué es una PWA?
Una aplicación web que se puede **instalar como app de escritorio** y funciona offline.

### Ventajas:
✅ Se instala como aplicación nativa (Windows/Mac/Linux)
✅ Funciona offline (con caché)
✅ Actualizaciones automáticas
✅ No necesita tienda de aplicaciones
✅ Un solo código para todas las plataformas

### Cómo Usar:

#### 1. Construir la PWA:
```bash
cd "EatsAndThinks Web Prototype"
npm install
npm run build
```

#### 2. Probar localmente:
```bash
npm run preview
```

Luego abre `http://localhost:4173` en tu navegador.

#### 3. Instalar como App de Escritorio:

**En Chrome/Edge:**
1. Abre la aplicación en el navegador
2. Click en el ícono de instalación (➕) en la barra de direcciones
3. Click en "Instalar"
4. ¡Listo! La app aparecerá en tu escritorio

**En Firefox:**
1. Menú → "Instalar sitio como aplicación"

#### 4. Desplegar en Internet:

**Frontend (Vercel - GRATIS):**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
cd "EatsAndThinks Web Prototype"
vercel --prod
```

**Backend (Railway - GRATIS hasta 500h/mes):**
1. Crea cuenta en [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Selecciona tu repositorio
4. Railway detectará Spring Boot automáticamente
5. Agrega MySQL desde "New" → "Database" → "MySQL"
6. Copia las variables de entorno a tu backend

**Alternativas:**
- **Render.com** (gratis para backend + MySQL)
- **Fly.io** (gratis para pequeñas apps)
- **Heroku** (con addon MySQL)

---

## 🐳 OPCIÓN C: DOCKER (Distribución Completa)

### ¿Qué es Docker?
Empaqueta toda la aplicación (frontend + backend + MySQL) en **contenedores** que funcionan en cualquier computadora.

### Ventajas:
✅ Funciona en Windows/Mac/Linux sin configuración
✅ Incluye TODO (frontend, backend, base de datos)
✅ Fácil de compartir y distribuir
✅ Entorno aislado (no afecta otras apps)

### Requisitos:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado

---

### 🎯 Comandos Docker

#### 1. Construir y Ejecutar TODO (1 comando):
```bash
docker-compose up --build
```

Esto:
- ✅ Construye el backend
- ✅ Construye el frontend
- ✅ Levanta MySQL
- ✅ Conecta todo automáticamente

**Acceder a la aplicación:**
- Frontend: http://localhost
- Backend API: http://localhost:8080
- MySQL: localhost:3307

**Usuario admin por defecto:**
- Email: `admin@eatsandthinks.com`
- Contraseña: `admin123`

#### 2. Ejecutar en segundo plano:
```bash
docker-compose up -d
```

#### 3. Ver logs:
```bash
docker-compose logs -f
```

#### 4. Detener todo:
```bash
docker-compose down
```

#### 5. Detener y BORRAR datos:
```bash
docker-compose down -v
```

---

### 📤 Distribuir la Aplicación Dockerizada

#### Opción 1: Exportar imágenes Docker
```bash
# Construir las imágenes
docker-compose build

# Exportar a archivos .tar
docker save eatsandthinks-backend:latest -o eatsandthinks-backend.tar
docker save eatsandthinks-frontend:latest -o eatsandthinks-frontend.tar

# Compartir estos archivos + docker-compose.yml
```

**El usuario final solo necesita:**
1. Instalar Docker Desktop
2. Ejecutar:
```bash
docker load -i eatsandthinks-backend.tar
docker load -i eatsandthinks-frontend.tar
docker-compose up -d
```

#### Opción 2: Subir a Docker Hub (gratis, público)
```bash
# Login en Docker Hub
docker login

# Tag y push
docker tag eatsandthinks-backend:latest tuusuario/eatsandthinks-backend:latest
docker push tuusuario/eatsandthinks-backend:latest

docker tag eatsandthinks-frontend:latest tuusuario/eatsandthinks-frontend:latest
docker push tuusuario/eatsandthinks-frontend:latest
```

Luego otros pueden ejecutar:
```bash
docker-compose pull
docker-compose up -d
```

---

## 🔧 Variables de Entorno

Copia `.env.example` como `.env` en la raíz del proyecto (el `.env` no se sube al repo):

```env
# Google Places API Key
GOOGLE_PLACES_API_KEY=tu_api_key_aqui

# Secreto para firmar los JWT (mínimo 32 caracteres aleatorios, ver .env.example)
JWT_SECRET=genera_uno_aleatorio

# MySQL (solo si usas Docker)
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=eatsandthinks
MYSQL_USER=eatsandthinks_user
MYSQL_PASSWORD=eatsandthinks_pass

# Backend
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/eatsandthinks
SPRING_DATASOURCE_USERNAME=eatsandthinks_user
SPRING_DATASOURCE_PASSWORD=eatsandthinks_pass
```

---

## 🎨 Personalizar Iconos PWA

Los iconos actuales son placeholders. Para usar tus propios iconos:

1. Abre `EatsAndThinks Web Prototype/generate-icons.html` en el navegador
2. Los iconos se descargarán automáticamente
3. O usa [realfavicongenerator.net](https://realfavicongenerator.net/)
4. Reemplaza los archivos en `public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `icon.svg`

---

## 🚨 Solución de Problemas

### Error: Puerto 80 ya en uso
```bash
# Cambiar puerto en docker-compose.yml:
ports:
  - "8080:80"  # Acceder en http://localhost:8080
```

### Error: MySQL no conecta
```bash
# Esperar a que MySQL inicie completamente
docker-compose logs mysql

# O reiniciar solo MySQL
docker-compose restart mysql
```

### Reiniciar desde cero
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 📊 Monitoreo

### Ver recursos usados:
```bash
docker stats
```

### Ver qué contenedores están corriendo:
```bash
docker ps
```

### Conectarse a MySQL:
```bash
docker exec -it eatsandthinks-mysql mysql -u root -p
# Contraseña: rootpassword
```

---

## 🎯 Resumen de Opciones

| Opción | Ventajas | Desventajas | Mejor para |
|--------|----------|-------------|------------|
| **PWA** | Fácil, Gratis, Se instala | Requiere internet | Usuarios finales |
| **Docker** | Todo incluido, Portátil | Más complejo | Desarrolladores |
| **PWA + Deploy** | Profesional, Escalable | Configuración inicial | Producción |

---

## 📝 Notas Finales

- **Backup:** Los datos de Docker se guardan en volúmenes. Usa `docker-compose down` (sin `-v`) para mantenerlos.
- **Actualizaciones:** Reconstruye con `docker-compose up --build` después de cambios en el código.
- **Seguridad:** Cambia las contraseñas por defecto en producción.

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica que Docker está corriendo
3. Asegúrate de tener puertos 80, 8080 y 3307 disponibles

---

**¡Listo! Tu aplicación EatsAndThinks está empaquetada y lista para distribuir! 🎉**

