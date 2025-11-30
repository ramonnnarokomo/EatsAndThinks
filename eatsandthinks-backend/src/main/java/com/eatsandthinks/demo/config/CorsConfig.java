package com.eatsandthinks.demo.config;

import java.util.Arrays;

import org.springframework.core.env.Environment; 
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final Environment env;

    public CorsConfig(Environment env) {
        this.env = env;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowedOrigins = env.getProperty("app.cors.allowedOrigins");

        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            String[] patterns = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);

            registry.addMapping("/**")
                    .allowedOriginPatterns(patterns)
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    }
}
