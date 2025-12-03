package com.eatsandthinks.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String nombre;

	@Column(unique = true)
	private String email;

	private String password;

	private String role = "USER";
	
	@Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
	private Boolean banned = false;
	
	@Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
	private Boolean canReview = true;

	@Column(nullable = false, columnDefinition = "INT DEFAULT 0")
	private Integer failedLoginAttempts = 0;

	private Boolean temporaryLock = false;

	private String recoveryPin;

	private LocalDateTime createdAt = LocalDateTime.now();

	private LocalDateTime lastLoginAt;

    @Column(length = 500)
    private String profileImageUrl;

	// getters & setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getLastLoginAt() {
		return lastLoginAt;
	}

	public void setLastLoginAt(LocalDateTime lastLoginAt) {
		this.lastLoginAt = lastLoginAt;
	}

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

	public Boolean getBanned() {
		return banned;
	}

	public void setBanned(Boolean banned) {
		this.banned = banned;
	}

	public Boolean getCanReview() {
		return canReview;
	}

	public void setCanReview(Boolean canReview) {
		this.canReview = canReview;
	}

	public Integer getFailedLoginAttempts() {
		return failedLoginAttempts;
	}

	public void setFailedLoginAttempts(Integer failedLoginAttempts) {
		this.failedLoginAttempts = failedLoginAttempts;
	}

	public Boolean getTemporaryLock() {
		return temporaryLock;
	}

	public void setTemporaryLock(Boolean temporaryLock) {
		this.temporaryLock = temporaryLock;
	}

	public String getRecoveryPin() {
		return recoveryPin;
	}

	public void setRecoveryPin(String recoveryPin) {
		this.recoveryPin = recoveryPin;
	}
}
