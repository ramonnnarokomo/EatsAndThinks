package com.eatsandthinks.demo.config;

// 1. Importa Environment
import org.springframework.core.env.Environment; 
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // 2. Quita @Value y declara Environment como 'final'
    private final Environment env;

    // 3. Inyéctalo en el constructor
    public CorsConfig(Environment env) {
        this.env = env;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        
        // 4. Lee la propiedad desde 'env' DENTRO del método
        String allowedOrigins = env.getProperty("app.cors.allowedOrigins");

        // 5. (Opcional pero recomendado) Comprobar que no es nulo
        if (allowedOrigins != null) {
            registry.addMapping("/**")
                    // Mantenemos tu lógica de .split() por si un día añades más dominios
                    .allowedOrigins(allowedOrigins.split(",")) 
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }
}