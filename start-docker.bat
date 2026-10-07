@echo off
echo ========================================
echo  EatsAndThinks - Inicio con Docker
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta corriendo.
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Docker detectado correctamente.

if not exist .env (
    echo ERROR: falta el fichero .env con la API key de Google y el secreto de JWT.
    echo Copia .env.example como .env y rellena los valores.
    pause
    exit /b 1
)
echo.
echo Iniciando aplicacion...
echo Frontend: http://localhost
echo Backend: http://localhost:8080
echo MySQL: localhost:3307
echo.
echo Usuario admin: admin@eatsandthinks.com
echo Contraseña: admin123
echo.
echo Presiona Ctrl+C para detener
echo.

docker-compose up --build

pause

