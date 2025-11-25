# 1. Etapa de Construcción (Build)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
# Compilamos saltando los tests para evitar errores tontos de entorno en el despliegue
RUN mvn clean package -DskipTests

# 2. Etapa de Ejecución (Run)
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
# Copiamos el JAR generado en la etapa anterior. 
# El asterisco *.jar asegura que funcione sin importar cómo se llame tu proyecto.
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8080
