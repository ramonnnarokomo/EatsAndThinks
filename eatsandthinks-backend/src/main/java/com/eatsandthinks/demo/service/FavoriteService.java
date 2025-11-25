package com.eatsandthinks.demo.service;

import com.eatsandthinks.demo.entity.Favorite;
import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.repository.FavoriteRepository;
import com.eatsandthinks.demo.repository.LocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final LocalRepository localRepository;
    private final GooglePlacesService googlePlacesService;

    @Autowired
    public FavoriteService(FavoriteRepository favoriteRepository, 
                          LocalRepository localRepository, 
                          GooglePlacesService googlePlacesService) {
        this.favoriteRepository = favoriteRepository;
        this.localRepository = localRepository;
        this.googlePlacesService = googlePlacesService;
    }

    /**
     * Agrega un local a favoritos
     * MEJORADO: Con reintentos y mejor manejo de errores
     */
    @Transactional
    public FavoriteDTO addFavorite(Long userId, String placeId) {
        System.out.println("========================================");
        System.out.println("❤️ INICIANDO addFavorite");
        System.out.println("👤 Usuario ID: " + userId);
        System.out.println("📍 Place ID: " + placeId);
        System.out.println("========================================");
        
        // Validaciones básicas
        if (userId == null || placeId == null || placeId.trim().isEmpty()) {
            System.err.println("❌ ERROR: Parámetros inválidos");
            throw new RuntimeException("Usuario ID o Place ID inválidos");
        }
        
        // 1. Buscar el local en la BD
        System.out.println("\n🔍 Paso 1: Buscando local en BD por placeId: " + placeId);
        LocalEntity local = localRepository.findByPlaceId(placeId).orElse(null);
        
        if (local == null) {
            System.out.println("⚠️ Local NO encontrado en BD");
            System.out.println("🌐 Intentando obtener de Google Places API...");
            
            // Intentar obtener detalles de Google con reintentos
            GooglePlacesService.PlaceDetails details = null;
            int maxRetries = 3;
            int retryDelay = 1000; // 1 segundo
            
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                System.out.println("\n🔄 Intento " + attempt + " de " + maxRetries);
                
                try {
                    details = googlePlacesService.getPlaceDetails(placeId);
                    
                    if (details != null && details.name != null) {
                        System.out.println("✅ Detalles obtenidos exitosamente");
                        break;
                    } else {
                        System.err.println("⚠️ Google Places devolvió null o datos incompletos");
                        
                        if (attempt < maxRetries) {
                            System.out.println("⏳ Esperando " + (retryDelay/1000) + " segundos antes de reintentar...");
                            Thread.sleep(retryDelay);
                            retryDelay *= 2; // Exponential backoff
                        }
                    }
                } catch (Exception e) {
                    System.err.println("❌ Error en intento " + attempt + ": " + e.getMessage());
                    
                    if (attempt < maxRetries) {
                        try {
                            Thread.sleep(retryDelay);
                            retryDelay *= 2;
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                    }
                }
            }
            
            // Verificar si obtuvimos los detalles
            if (details == null || details.name == null) {
                System.err.println("\n❌❌❌ ERROR FINAL ❌❌❌");
                System.err.println("No se pudo obtener información del local después de " + maxRetries + " intentos");
                System.err.println("PlaceId: " + placeId);
                System.err.println("Posibles causas:");
                System.err.println("  1. El placeId es inválido o ha cambiado");
                System.err.println("  2. La API Key de Google no tiene permisos");
                System.err.println("  3. Se excedió el límite de peticiones");
                System.err.println("  4. Problemas de conectividad");
                throw new RuntimeException("No se pudo obtener información del local de Google Places");
            }
            
            // 2. Crear el local con los datos de Google
            System.out.println("\n✅ Datos obtenidos de Google Places:");
            System.out.println("  📝 Nombre: " + details.name);
            System.out.println("  📍 Dirección: " + details.formattedAddress);
            System.out.println("  🏷️ Tipo: " + details.type);
            System.out.println("  ⭐ Rating: " + details.rating);
            System.out.println("  📊 Total reseñas: " + details.userRatingsTotal);
            
            System.out.println("\n💾 Paso 2: Creando local en BD...");
            
            local = new LocalEntity();
            local.setPlaceId(placeId);
            local.setNombre(details.name);
            local.setDireccion(details.formattedAddress);
            local.setTipo(details.type);
            local.setLatitud(details.lat);
            local.setLongitud(details.lng);
            local.setRating(details.rating);
            local.setTotalValoraciones(details.userRatingsTotal);
            local.setPrecioNivel(details.priceLevel);
            local.setFotoRef(details.photoRef);
            local.setAbierto(details.openNow);
            local.setSource(LocalEntity.Source.GOOGLE);
            
            try {
                local = localRepository.save(local);
                System.out.println("✅ Local guardado en BD con ID: " + local.getId());
            } catch (Exception e) {
                System.err.println("❌ Error guardando local en BD:");
                System.err.println("  💬 Mensaje: " + e.getMessage());
                System.err.println("  📋 Tipo: " + e.getClass().getName());
                e.printStackTrace();
                throw new RuntimeException("Error al guardar el local en la base de datos: " + e.getMessage());
            }
        } else {
            System.out.println("✅ Local encontrado en BD");
            System.out.println("  🆔 ID: " + local.getId());
            System.out.println("  📝 Nombre: " + local.getNombre());
        }
        
        // 3. Verificar si ya existe en favoritos
        System.out.println("\n🔍 Paso 3: Verificando si ya está en favoritos...");
        boolean alreadyFavorite = favoriteRepository.existsByUserIdAndLocalId(userId, local.getId());
        
        if (alreadyFavorite) {
            System.out.println("⚠️ El local YA está en favoritos del usuario");
            throw new RuntimeException("El local ya está en favoritos");
        }
        
        System.out.println("✅ El local NO está en favoritos, procediendo a agregar...");
        
        // 4. Crear el favorito
        System.out.println("\n💾 Paso 4: Creando favorito en BD...");
        
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setLocalId(local.getId());
        favorite.setPlaceId(placeId);
        favorite.setCreatedAt(LocalDateTime.now());
        
        try {
            Favorite saved = favoriteRepository.save(favorite);
            System.out.println("✅ Favorito guardado con ID: " + saved.getId());
            System.out.println("\n========================================");
            System.out.println("✅✅✅ FAVORITO AGREGADO EXITOSAMENTE ✅✅✅");
            System.out.println("========================================\n");
            
            return toDTO(saved, local);
        } catch (Exception e) {
            System.err.println("❌ Error guardando favorito:");
            System.err.println("  💬 Mensaje: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al guardar favorito: " + e.getMessage());
        }
    }

    /**
     * Elimina un local de favoritos
     */
    @Transactional
    public void removeFavorite(Long userId, String placeId) {
        System.out.println("💔 Eliminando favorito - Usuario: " + userId + ", Place: " + placeId);
        
        LocalEntity local = localRepository.findByPlaceId(placeId).orElse(null);
        
        if (local == null) {
            System.err.println("⚠️ Local no encontrado para eliminar de favoritos");
            throw new RuntimeException("Local no encontrado");
        }
        
        try {
            favoriteRepository.deleteByUserIdAndLocalId(userId, local.getId());
            System.out.println("✅ Favorito eliminado correctamente");
        } catch (Exception e) {
            System.err.println("❌ Error eliminando favorito: " + e.getMessage());
            throw new RuntimeException("Error al eliminar favorito: " + e.getMessage());
        }
    }

    /**
     * Obtiene todos los favoritos de un usuario
     */
    public List<FavoriteDTO> getUserFavorites(Long userId) {
        System.out.println("📋 Obteniendo favoritos del usuario: " + userId);
        
        try {
            List<Favorite> favorites = favoriteRepository.findByUserId(userId);
            System.out.println("✅ Encontrados " + favorites.size() + " favoritos");
            
            return favorites.stream()
                .map(fav -> {
                    LocalEntity local = localRepository.findById(fav.getLocalId()).orElse(null);
                    if (local == null) {
                        System.err.println("⚠️ Local no encontrado para favorito ID: " + fav.getId());
                    }
                    return toDTO(fav, local);
                })
                .filter(dto -> dto.local() != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo favoritos: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Verifica si un local está en favoritos
     */
    public boolean isFavorite(Long userId, String placeId) {
        try {
            LocalEntity local = localRepository.findByPlaceId(placeId).orElse(null);
            if (local == null) {
                return false;
            }
            boolean exists = favoriteRepository.existsByUserIdAndLocalId(userId, local.getId());
            System.out.println("🔍 PlaceId " + placeId + " es favorito: " + exists);
            return exists;
        } catch (Exception e) {
            System.err.println("❌ Error verificando favorito: " + e.getMessage());
            return false;
        }
    }

    private FavoriteDTO toDTO(Favorite favorite, LocalEntity local) {
        if (local == null) {
            return null;
        }
        
        LocalDTO localDTO = new LocalDTO(
            local.getPlaceId(),
            local.getNombre(),
            local.getDireccion(),
            local.getRating(),
            local.getTotalValoraciones(),
            local.getPrecioNivel(),
            local.getTipo(),
            local.getFotoRef()
        );
        
        return new FavoriteDTO(
            favorite.getId(),
            favorite.getUserId(),
            favorite.getCreatedAt(),
            localDTO
        );
    }

    // DTOs
    public record FavoriteDTO(
        Long id,
        Long userId,
        LocalDateTime createdAt,
        LocalDTO local
    ) {}

    public record LocalDTO(
        String placeId,
        String name,
        String address,
        Double rating,
        Integer totalRatings,
        Integer priceLevel,
        String type,
        String photoRef
    ) {}
}