package com.eatsandthinks.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "locales")
public class LocalEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "place_id", unique = true)
	private String placeId; // null si creado por usuario

	private String nombre;
	private String direccion;
	private Double latitud;
	private Double longitud;
	private Double rating;
	private Integer totalValoraciones;
	private Integer precioNivel;
	private Boolean abierto;
	private String tipo;

	@Column(length = 2000)
	private String fotoRef;

	private Long creadoPorUsuarioId;

	@Enumerated(EnumType.STRING)
	private Source source = Source.GOOGLE;

	private LocalDateTime createdAt = LocalDateTime.now();

	public enum Source {
		GOOGLE, LOCAL
	}

	// Getters y setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getPlaceId() {
		return placeId;
	}

	public void setPlaceId(String placeId) {
		this.placeId = placeId;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDireccion() {
		return direccion;
	}

	public void setDireccion(String direccion) {
		this.direccion = direccion;
	}

	public Double getLatitud() {
		return latitud;
	}

	public void setLatitud(Double latitud) {
		this.latitud = latitud;
	}

	public Double getLongitud() {
		return longitud;
	}

	public void setLongitud(Double longitud) {
		this.longitud = longitud;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public Integer getTotalValoraciones() {
		return totalValoraciones;
	}

	public void setTotalValoraciones(Integer totalValoraciones) {
		this.totalValoraciones = totalValoraciones;
	}

	public Integer getPrecioNivel() {
		return precioNivel;
	}

	public void setPrecioNivel(Integer precioNivel) {
		this.precioNivel = precioNivel;
	}

	public Boolean getAbierto() {
		return abierto;
	}

	public void setAbierto(Boolean abierto) {
		this.abierto = abierto;
	}

	public String getTipo() {
		return tipo;
	}

	public void setTipo(String tipo) {
		this.tipo = tipo;
	}

	public String getFotoRef() {
		return fotoRef;
	}

	public void setFotoRef(String fotoRef) {
		this.fotoRef = fotoRef;
	}

	public Long getCreadoPorUsuarioId() {
		return creadoPorUsuarioId;
	}

	public void setCreadoPorUsuarioId(Long creadoPorUsuarioId) {
		this.creadoPorUsuarioId = creadoPorUsuarioId;
	}

	public Source getSource() {
		return source;
	}

	public void setSource(Source source) {
		this.source = source;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
