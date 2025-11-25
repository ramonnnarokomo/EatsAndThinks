package com.eatsandthinks.demo.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import reactor.core.publisher.Mono;

@Service
public class GooglePlacesService {

    private final WebClient webClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;
    
    // Coordenadas del centro de Madrid
    private static final double MADRID_LAT = 40.4168;
    private static final double MADRID_LNG = -3.7038;
    private static final int MADRID_RADIUS = 30000; // 30km

    // Tipos gastronómicos permitidos
    private static final List<String> ALLOWED_GASTRONOMIC_TYPES = Arrays.asList(
        "restaurant", "cafe", "bar", "bakery", "food", 
        "meal_takeaway", "meal_delivery", "liquor_store",
        "night_club", "bakery", "cafe", "restaurant"
    );

    public GooglePlacesService(WebClient webClient, Environment env) {
        this.webClient = webClient;
        this.apiKey = env.getProperty("google.places.api.key"); 
        this.objectMapper = new ObjectMapper();
        
        System.out.println("🔑 API Key cargada (desde Environment): " + (apiKey != null && !apiKey.isEmpty() ? "SÍ" : "NO"));
    }

    /**
     * Obtiene detalles completos de un lugar por placeId
     * MEJORADO: Con manejo robusto de errores
     */
    public PlaceDetails getPlaceDetails(String placeId) {
        try {
            System.out.println("🔍 [GooglePlacesService] Iniciando getPlaceDetails para: " + placeId);
            
            if (apiKey == null || apiKey.isEmpty()) {
                System.err.println("❌ ERROR CRÍTICO: API Key no configurada");
                return null;
            }
            
            System.out.println("🌐 Construyendo URL para Google Places API...");
            String url = String.format(
                "https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=%s&language=es&key=%s",
                placeId,
                "name,formatted_address,geometry,rating,user_ratings_total,price_level,photos,types,formatted_phone_number,website,opening_hours,reviews",
                apiKey
            );
            
            System.out.println("📡 Haciendo petición a Google Places API...");
            
            Mono<String> responseMono = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnError(error -> {
                        System.err.println("❌ Error en la petición HTTP: " + error.getMessage());
                        if (error instanceof WebClientResponseException) {
                            WebClientResponseException webError = (WebClientResponseException) error;
                            System.err.println("📋 Status Code: " + webError.getStatusCode());
                            System.err.println("📋 Response Body: " + webError.getResponseBodyAsString());
                        }
                    });

            String responseBody = responseMono.block();
            
            if (responseBody == null || responseBody.isEmpty()) {
                System.err.println("❌ Respuesta vacía de Google Places");
                return null;
            }
            
            System.out.println("📦 Respuesta recibida, parseando JSON...");
            System.out.println("📄 Primeros 200 caracteres: " + responseBody.substring(0, Math.min(200, responseBody.length())));
            
            JsonNode root = objectMapper.readTree(responseBody);
            String status = root.path("status").asText();
            
            System.out.println("📊 Status de Google: " + status);
            
            if (!"OK".equals(status)) {
                String errorMessage = root.path("error_message").asText("Sin mensaje de error");
                System.err.println("❌ Google Places devolvió status: " + status);
                System.err.println("💬 Mensaje de error: " + errorMessage);
                
                // Casos específicos
                if ("INVALID_REQUEST".equals(status)) {
                    System.err.println("🔍 El placeId podría ser inválido o el formato de la petición es incorrecto");
                }
                if ("NOT_FOUND".equals(status)) {
                    System.err.println("🔍 El placeId no existe en Google Places");
                }
                if ("OVER_QUERY_LIMIT".equals(status)) {
                    System.err.println("🔍 Has excedido el límite de consultas de la API");
                }
                if ("REQUEST_DENIED".equals(status)) {
                    System.err.println("🔍 La API Key está incorrecta o no tiene permisos");
                }
                
                return null;
            }
            
            JsonNode result = root.path("result");
            
            if (result.isMissingNode()) {
                System.err.println("❌ No hay datos en 'result'");
                return null;
            }
            
            PlaceDetails details = new PlaceDetails();
            
            // Datos básicos
            details.placeId = placeId;
            details.name = safeText(result, "name");
            details.formattedAddress = safeText(result, "formatted_address");
            
            System.out.println("✅ Nombre del lugar: " + details.name);
            System.out.println("✅ Dirección: " + details.formattedAddress);
            
            // Geometría
            JsonNode geometry = result.path("geometry");
            if (!geometry.isMissingNode()) {
                JsonNode location = geometry.path("location");
                details.lat = location.path("lat").asDouble();
                details.lng = location.path("lng").asDouble();
                System.out.println("📍 Coordenadas: " + details.lat + ", " + details.lng);
            }
            
            // Rating
            details.rating = result.path("rating").isMissingNode() ? null : result.path("rating").asDouble();
            details.userRatingsTotal = result.path("user_ratings_total").isMissingNode() ? 0 : result.path("user_ratings_total").asInt();
            details.priceLevel = result.path("price_level").isMissingNode() ? null : result.path("price_level").asInt();
            details.phoneNumber = safeText(result, "formatted_phone_number");
            details.website = safeText(result, "website");
            
            System.out.println("⭐ Rating: " + details.rating + " (" + details.userRatingsTotal + " reseñas)");
            System.out.println("💰 Precio: " + (details.priceLevel != null ? "€".repeat(details.priceLevel) : "N/A"));
            
            // Foto principal
            if (result.has("photos") && result.get("photos").isArray() && result.get("photos").size() > 0) {
                details.photoRef = result.get("photos").get(0).path("photo_reference").asText(null);
                System.out.println("📸 Foto disponible: " + (details.photoRef != null ? "SÍ" : "NO"));
            }
            
            // Tipo
            if (result.has("types") && result.get("types").isArray() && result.get("types").size() > 0) {
                details.type = result.get("types").get(0).asText();
                System.out.println("🏷️ Tipo: " + details.type);
            }
            
            // Horarios
            if (result.has("opening_hours")) {
                JsonNode hours = result.get("opening_hours");
                details.openNow = hours.path("open_now").asBoolean(false);
                System.out.println("🕐 Abierto ahora: " + details.openNow);
                
                if (hours.has("weekday_text")) {
                    List<String> weekdayTexts = new ArrayList<>();
                    for (JsonNode day : hours.get("weekday_text")) {
                        weekdayTexts.add(day.asText());
                    }
                    details.openingHours = weekdayTexts;
                }
            }
            
            // Reseñas de Google
            if (result.has("reviews")) {
                List<GoogleReview> reviews = new ArrayList<>();
                int reviewCount = 0;
                for (JsonNode reviewNode : result.get("reviews")) {
                    GoogleReview review = new GoogleReview();
                    review.authorName = safeText(reviewNode, "author_name");
                    review.rating = reviewNode.path("rating").asInt();
                    review.text = safeText(reviewNode, "text");
                    review.time = reviewNode.path("time").asLong();
                    review.relativeTimeDescription = safeText(reviewNode, "relative_time_description");
                    reviews.add(review);
                    reviewCount++;
                }
                details.reviews = reviews;
                System.out.println("💬 Reseñas de Google: " + reviewCount);
            }
            
            System.out.println("✅✅✅ Detalles obtenidos exitosamente para: " + details.name);
            return details;
            
        } catch (Exception e) {
            System.err.println("❌❌❌ Error inesperado en getPlaceDetails:");
            System.err.println("📋 Tipo de error: " + e.getClass().getName());
            System.err.println("💬 Mensaje: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Busca lugares limitados estrictamente a la Comunidad de Madrid
     * y filtra solo tipos gastronómicos
     */
    public List<GooglePlace> searchPlaces(String query) {
        try {
            System.out.println("🔑 API Key: " + (apiKey != null ? "PRESENTE" : "AUSENTE"));
            
            if (apiKey == null || apiKey.isEmpty()) {
                System.out.println("❌ ERROR: API Key no configurada");
                return new ArrayList<>();
            }
            
            System.out.println("🌐 Realizando búsqueda GASTRONÓMICA en Madrid...");
            System.out.println("📋 Query original: " + query);
            
            String madridQuery = query + " Madrid España";
            
            Mono<String> responseMono = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("maps.googleapis.com")
                            .path("/maps/api/place/textsearch/json")
                            .queryParam("query", madridQuery)
                            .queryParam("location", MADRID_LAT + "," + MADRID_LNG)
                            .queryParam("radius", MADRID_RADIUS)
                            .queryParam("region", "es")
                            .queryParam("language", "es")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class);

            String responseBody = responseMono.block();
            
            if (responseBody == null || responseBody.isEmpty()) {
                System.out.println("❌ Respuesta vacía de Google Places");
                return new ArrayList<>();
            }
            
            JsonNode root = objectMapper.readTree(responseBody);
            String status = root.path("status").asText();
            System.out.println("✅ Status: " + status);
            
            if (!"OK".equals(status)) {
                System.out.println("❌ Estado: " + status);
                String errorMessage = root.path("error_message").asText();
                System.out.println("💥 Error: " + errorMessage);
                return new ArrayList<>();
            }
            
            List<GooglePlace> out = new ArrayList<>();
            if (root.has("results")) {
                JsonNode results = root.get("results");
                System.out.println("📢 Resultados encontrados antes de filtrar: " + results.size());
                
                for (JsonNode r : results) {
                    GooglePlace p = new GooglePlace();
                    p.placeId = safeText(r, "place_id");
                    p.name = safeText(r, "name");
                    p.formattedAddress = safeText(r, "formatted_address");
                    p.lat = r.path("geometry").path("location").path("lat").asDouble();
                    p.lng = r.path("geometry").path("location").path("lng").asDouble();
                    p.rating = r.path("rating").isMissingNode() ? null : r.path("rating").asDouble();
                    p.userRatingsTotal = r.path("user_ratings_total").isMissingNode() ? 0 : r.path("user_ratings_total").asInt();
                    p.priceLevel = r.path("price_level").isMissingNode() ? null : r.path("price_level").asInt();
                    p.openNow = r.path("opening_hours").path("open_now").asBoolean(false);
                    
                    List<String> types = new ArrayList<>();
                    if (r.has("types") && r.get("types").isArray()) {
                        for (JsonNode typeNode : r.get("types")) {
                            types.add(typeNode.asText());
                        }
                    }
                    p.types = types;
                    
                    boolean isGastronomic = types.stream()
                        .anyMatch(type -> ALLOWED_GASTRONOMIC_TYPES.contains(type));
                    
                    if (!isGastronomic) {
                        System.out.println("🚫 Filtrado lugar no gastronómico: " + p.name + " - Tipos: " + types);
                        continue;
                    }
                    
                    if (r.has("photos") && r.get("photos").isArray() && r.get("photos").size() > 0) {
                        p.photoRef = r.get("photos").get(0).path("photo_reference").asText(null);
                    }
                    
                    if (types.size() > 0) {
                        p.type = types.get(0);
                    }
                    
                    out.add(p);
                    System.out.println("✅ Incluido lugar gastronómico: " + p.name + " - Tipo: " + p.type);
                }
            }
            
            System.out.println("🎯 Lugares gastronómicos en Madrid: " + out.size());
            return out;
            
        } catch (Exception e) {
            System.out.println("💥 Error en searchPlaces: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    private static String safeText(JsonNode node, String field) {
        return node.has(field) ? node.get(field).asText() : null;
    }
    
    public static class GooglePlace {
        public String placeId;
        public String name;
        public String formattedAddress;
        public Double lat;
        public Double lng;
        public Double rating;
        public Integer userRatingsTotal;
        public Integer priceLevel;
        public Boolean openNow;
        public String photoRef;
        public String type;
        public List<String> types;

        public Double getRating() { return rating; }
        public Integer getPriceLevel() { return priceLevel; }
        public Boolean getOpenNow() { return openNow; }
        public List<String> getTypes() { return types; }
        public String getType() { return type; }
    }
    
    public static class PlaceDetails {
        public String placeId;
        public String name;
        public String formattedAddress;
        public Double lat;
        public Double lng;
        public Double rating;
        public Integer userRatingsTotal;
        public Integer priceLevel;
        public Boolean openNow;
        public String photoRef;
        public String type;
        public String phoneNumber;
        public String website;
        public List<String> openingHours;
        public List<GoogleReview> reviews;
    }
    
    public static class GoogleReview {
        public String authorName;
        public Integer rating;
        public String text;
        public Long time;
        public String relativeTimeDescription;
    }
}