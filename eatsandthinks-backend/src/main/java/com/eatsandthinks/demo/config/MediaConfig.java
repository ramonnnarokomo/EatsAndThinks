package com.eatsandthinks.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class MediaConfig implements WebMvcConfigurer {

    @Value("${app.media.base-dir:uploads}")
    private String mediaBaseDir;

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(mediaBaseDir).toAbsolutePath().normalize();
            Files.createDirectories(path.resolve("avatars"));
        } catch (Exception ignored) {}
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(mediaBaseDir).toAbsolutePath().normalize();
        String resourceLocation = uploadPath.toUri().toString();
        registry.addResourceHandler("/media/**")
            .addResourceLocations(resourceLocation.endsWith("/") ? resourceLocation : resourceLocation + "/");
    }
}


