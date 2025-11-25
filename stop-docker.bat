@echo off
echo ========================================
echo  EatsAndThinks - Detener Docker
echo ========================================
echo.

echo Deteniendo contenedores...
docker-compose down

echo.
echo Aplicacion detenida correctamente.
echo.
echo Para eliminar tambien los datos (reset completo):
echo   docker-compose down -v
echo.
pause

