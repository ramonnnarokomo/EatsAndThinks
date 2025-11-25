# 1. Etapa de Construcción (Build)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .

# Lógica inteligente:
# 1. Si existe la carpeta 'eatsandthinks-backend', entramos y compilamos ahí.
# 2. Si no, asumimos que ya estamos dentro y compilamos aquí.
# 3. Al final, movemos el .jar generado a /app/final.jar para que el siguiente paso lo encuentre fácil.
RUN if [ -d "eatsandthinks-backend" ] && [ -f "eatsandthinks-backend/pom.xml" ]; then \
        cd eatsandthinks-backend && mvn clean package -DskipTests && mv target/*.jar /app/final.jar; \
    else \
        mvn clean package -DskipTests && mv target/*.jar /app/final.jar; \
    fi

# 2. Etapa de Ejecución (Run)
FROM eclipse-temurin:17-jdk-alpine
# Copiamos el JAR desde la ubicación unificada
COPY --from=build /app/final.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8080