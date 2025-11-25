# Dockerfile para Railway
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar archivos del proyecto
COPY pom.xml .
COPY src ./src

# Construir el JAR
RUN mvn clean package -DskipTests

# Imagen final
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR construido
COPY --from=build /app/target/*.jar app.jar

# Puerto
EXPOSE 8080

# Ejecutar
CMD ["java", "-jar", "app.jar"]
