# EatsAndThinks

Aplicación web y PWA para descubrir sitios donde comer en Madrid, guardarlos como favoritos y dejar reseñas. La hice como proyecto de fin de ciclo del grado superior de Desarrollo de Aplicaciones Multiplataforma.

Puedes probarla directamente aquí: https://eats-and-thinks-web-prototype.vercel.app/ (Servidor ahora en mantenimiento)

## Qué hace

Buscas restaurantes por zona y te salen los que hay cerca, con su ficha: fotos, tipo de cocina, valoración, horario y accesos directos a la web del local y a la ruta en Google Maps. Puedes filtrar por tipo de cocina, rango de precio, valoración mínima y si están abiertos en ese momento.

Con cuenta puedes guardar sitios en favoritos, escribir reseñas y responder a las de otros. Hay panel de notificaciones y un historial de lo que has ido viendo. Los administradores tienen un panel aparte para gestionar los locales añadidos por la comunidad.

Los datos de los establecimientos vienen de Google Places. Las reseñas, favoritos y usuarios son propios y se guardan en mi base de datos.

Está pensada para móvil primero: la navegación entre Search, Favorites y Profile se despliega desde arriba, el botón atrás sigue el flujo que espera el usuario y el listado con infinite scroll conserva la posición cuando vuelves de la ficha de un restaurante. En escritorio hay una barra lateral colapsable.

## Stack

**Frontend.** React 18 con TypeScript sobre Vite, con el plugin de PWA para que sea instalable. Tailwind CSS y shadcn/ui para la interfaz, react-toastify para los avisos. Las llamadas al backend van con Axios y un interceptor que engancha el JWT en las peticiones autenticadas. El estado global lo llevo con contextos de React, sin librería externa: para una app de este tamaño Redux era pasarse.

**Backend.** Spring Boot 3 con Spring Security y autenticación por JWT. Persistencia con JPA sobre MySQL. Los servicios están separados por dominio: `Review`, `Users`, `Places` y `Traceability`. Es el backend el que habla con Google Places, no el navegador, para no exponer la API key en el cliente.

**Infraestructura.** Docker Compose con builds multi-etapa levanta frontend, backend y MySQL de una vez. En producción hay un Nginx haciendo de proxy. El front está desplegado en Vercel y el backend con su MySQL en Railway.

## Arranque rápido

Lo más cómodo es Docker, que te levanta las tres piezas sin configurar nada más:

```bash
# Windows
start-docker.bat

# Mac / Linux
docker-compose up --build
```

Si prefieres levantarlo a mano necesitas JDK 17 y Node 18 o superior:

```bash
cd eatsandthinks-backend
./mvnw spring-boot:run

cd "../EatsAndThinks Web Prototype"
npm install
npm run dev
```

## Variables de entorno

```
GOOGLE_PLACES_API_KEY=tu_api_key
MYSQL_ROOT_PASSWORD=secreto
MYSQL_DATABASE=eatsandthinks
```

La API key la sacas de Google Cloud con Places API y Maps JavaScript API activadas.

## Estructura

```
eatsandthinks-backend/          API REST, seguridad y servicios
EatsAndThinks Web Prototype/    UI, componentes, contextos, servicios y estilos
docker-compose.yml              Orquestación de frontend, backend y MySQL
init-db.sql                     Datos iniciales
start-docker.bat / stop-docker.bat
```

Hay documentación aparte en `DEPLOYMENT.md` (despliegue de la PWA y de Docker), `MAPA_TRAZABILIDAD.md` (arquitectura y trazabilidad de requisitos) y `src/services/ApiExamples.ts` (ejemplos de peticiones, reintentos y manejo de errores HTTP). `generate-icons.html` genera los iconos de la PWA.

## Comandos frecuentes

```bash
# Levantar el stack completo
docker-compose up --build

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild desde cero, borrando volúmenes
docker-compose down -v && docker-compose up --build

# Frontend
npm run dev
npm run build
npm run preview

# Backend
cd eatsandthinks-backend
./mvnw spring-boot:run
```

## Despliegue

Frontend en Vercel:

```bash
npm install -g vercel
cd "EatsAndThinks Web Prototype"
vercel --prod
```

Backend y base de datos en Railway: creas el proyecto, lo conectas al repo de GitHub, añades una base de datos MySQL y configuras las variables de entorno de arriba.

## Cosas que me costaron

**CORS con las peticiones preflight.** Tenía CORS configurado en el backend y aun así el navegador bloqueaba todo con "Access-Control-Allow-Origin missing". El problema era que no estaba permitiendo el método OPTIONS, que es el que manda el navegador antes de la petición real. Se arreglaba con una línea en `SecurityConfig.java`, pero tardé un buen rato en dar con ello.

**Los filtros no llegaban al backend.** Los mandaba como objeto y se perdían por el camino. Acabé construyendo el query string a mano con `URLSearchParams`.

**401 en todas las peticiones autenticadas.** El interceptor de Axios petaba cuando el token era `null` (usuario sin loguear) y dejaba de adjuntar la cabecera en las llamadas siguientes. Se resolvió comprobando que el token existe antes de añadirlo.

**Locales sin fotos.** Google Places no siempre devuelve imágenes y la pantalla quedaba con huecos. Monté un pool de imágenes de respaldo categorizadas por tipo de cocina: si no hay foto, se usa una del pool que corresponda.

## Problemas comunes al levantarlo

- Si los puertos están ocupados, cámbialos en `docker-compose.yml` (`ports: - "8081:80"`).
- Para ver qué le pasa a MySQL: `docker-compose logs mysql` y `docker inspect eatsandthinks-mysql`.
- Si el front se queda raro tras cambiar dependencias, borra `node_modules` y `package-lock.json` y reinstala.

## Limitaciones

- No hay tests automatizados. Las pruebas fueron manuales, que es lo que pedía el proyecto, pero es lo primero que le añadiría.
- Las reseñas no tienen moderación ni sistema de reportes más allá del panel de administración.
- Cada búsqueda pega a la API de Google Places. Con tráfico real habría que cachear las respuestas en base de datos con un tiempo de expiración, porque la cuota gratuita mensual se agota rápido.
- El diseño está pensado para móvil. En escritorio funciona, pero se nota que no es donde puse el esfuerzo.
