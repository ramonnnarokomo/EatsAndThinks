package com.eatsandthinks.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.repository.LocalRepository;

@Service
public class LocalService {

    private final GooglePlacesService google;
    private final LocalRepository localRepo;

    public LocalService(GooglePlacesService google, LocalRepository localRepo) {
        this.google = google;
        this.localRepo = localRepo;
    }

    /**
     * Obtiene todos los locales gestionados por la aplicación (solo de la BD local)
     */
    public List<LocalDetailsDTO> getAllLocales() {
        List<LocalEntity> locals = localRepo.findAll();
        return locals.stream()
                .map(this::fromEntityToDetailsDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un local específico por su placeId (incluyendo reseñas si es necesario)
     */
    public LocalDetailsDTO getLocalDetails(String placeId) {
        Optional<LocalEntity> localOpt = localRepo.findByPlaceId(placeId);
        if (localOpt.isEmpty()) {
            return null;
        }
        return fromEntityToDetailsDTO(localOpt.get());
    }

    /**
     * Crea un nuevo local en la base de datos
     */
    public LocalEntity createLocal(LocalEntity e) {
        e.setSource(LocalEntity.Source.LOCAL);
        return localRepo.save(e);
    }

    /**
     * Busca locales combinando resultados de Google y la BD local
     */
    public List<LocalDTO> getCombined(String query) {
        List<LocalDTO> out = new ArrayList<>();

        // Google
        List<GooglePlacesService.GooglePlace> gplaces = google.searchPlaces(query);
        out.addAll(gplaces.stream().map(this::fromGoogle).collect(Collectors.toList()));

        // Local DB (user-created)
        List<LocalEntity> locals = localRepo.findAll();
        out.addAll(locals.stream().map(this::fromEntityToDTO).collect(Collectors.toList()));

        return out;
    }

    private LocalDTO fromGoogle(GooglePlacesService.GooglePlace g) {
        LocalDTO d = new LocalDTO();
        d.setPlaceId(g.placeId);
        d.setNombre(g.name);
        d.setDireccion(g.formattedAddress);
        d.setLat(g.lat);
        d.setLng(g.lng);
        d.setRating(g.rating);
        d.setTotalValoraciones(g.userRatingsTotal);
        d.setTipo(g.type);
        d.setFuente("GOOGLE");
        d.setFotoRef(g.photoRef);
        return d;
    }

    private LocalDTO fromEntityToDTO(LocalEntity e) {
        LocalDTO d = new LocalDTO();
        d.setId(e.getId());
        d.setPlaceId(e.getPlaceId());
        d.setNombre(e.getNombre());
        d.setDireccion(e.getDireccion());
        d.setLat(e.getLatitud());
        d.setLng(e.getLongitud());
        d.setRating(e.getRating());
        d.setTotalValoraciones(e.getTotalValoraciones());
        d.setPrecioNivel(e.getPrecioNivel());
        d.setAbierto(e.getAbierto());
        d.setTipo(e.getTipo());
        d.setFuente(e.getSource().name());
        d.setFotoRef(e.getFotoRef());
        return d;
    }

    private LocalDetailsDTO fromEntityToDetailsDTO(LocalEntity e) {
        LocalDetailsDTO d = new LocalDetailsDTO();
        d.setId(e.getId());
        d.setPlaceId(e.getPlaceId());
        d.setNombre(e.getNombre());
        d.setDireccion(e.getDireccion());
        d.setLat(e.getLatitud());
        d.setLng(e.getLongitud());
        d.setRating(e.getRating());
        d.setTotalValoraciones(e.getTotalValoraciones());
        d.setPrecioNivel(e.getPrecioNivel());
        d.setAbierto(e.getAbierto());
        d.setTipo(e.getTipo());
        d.setFuente(e.getSource().name());
        d.setFotoRef(e.getFotoRef());
        d.setCreadoPorUsuarioId(e.getCreadoPorUsuarioId());
        d.setCreatedAt(e.getCreatedAt());
        // Aquí puedes agregar las reseñas cuando implementes esa funcionalidad
        // d.setResenas(resenaService.findByLocalId(e.getId()));
        return d;
    }

    // DTO básico para listados
    public static class LocalDTO {
        private Long id;
        private String placeId;
        private String nombre;
        private String direccion;
        private Double lat;
        private Double lng;
        private Double rating;
        private Integer totalValoraciones;
        private Integer precioNivel;
        private Boolean abierto;
        private String tipo;
        private String fotoRef;
        private String fuente;
        
        // getters & setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        public Integer getTotalValoraciones() { return totalValoraciones; }
        public void setTotalValoraciones(Integer totalValoraciones) { this.totalValoraciones = totalValoraciones; }
        public Integer getPrecioNivel() { return precioNivel; }
        public void setPrecioNivel(Integer precioNivel) { this.precioNivel = precioNivel; }
        public Boolean getAbierto() { return abierto; }
        public void setAbierto(Boolean abierto) { this.abierto = abierto; }
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public String getFotoRef() { return fotoRef; }
        public void setFotoRef(String fotoRef) { this.fotoRef = fotoRef; }
        public String getFuente() { return fuente; }
        public void setFuente(String fuente) { this.fuente = fuente; }
    }

    // DTO detallado para vistas individuales
    public static class LocalDetailsDTO {
        private Long id;
        private String placeId;
        private String nombre;
        private String direccion;
        private Double lat;
        private Double lng;
        private Double rating;
        private Integer totalValoraciones;
        private Integer precioNivel;
        private Boolean abierto;
        private String tipo;
        private String fotoRef;
        private String fuente;
        private Long creadoPorUsuarioId;
        private java.time.LocalDateTime createdAt;
        // private List<ResenaDTO> resenas; // Para futura implementación
        
        // getters & setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPlaceId() { return placeId; }
        public void setPlaceId(String placeId) { this.placeId = placeId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }
        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        public Integer getTotalValoraciones() { return totalValoraciones; }
        public void setTotalValoraciones(Integer totalValoraciones) { this.totalValoraciones = totalValoraciones; }
        public Integer getPrecioNivel() { return precioNivel; }
        public void setPrecioNivel(Integer precioNivel) { this.precioNivel = precioNivel; }
        public Boolean getAbierto() { return abierto; }
        public void setAbierto(Boolean abierto) { this.abierto = abierto; }
        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public String getFotoRef() { return fotoRef; }
        public void setFotoRef(String fotoRef) { this.fotoRef = fotoRef; }
        public String getFuente() { return fuente; }
        public void setFuente(String fuente) { this.fuente = fuente; }
        public Long getCreadoPorUsuarioId() { return creadoPorUsuarioId; }
        public void setCreadoPorUsuarioId(Long creadoPorUsuarioId) { this.creadoPorUsuarioId = creadoPorUsuarioId; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}