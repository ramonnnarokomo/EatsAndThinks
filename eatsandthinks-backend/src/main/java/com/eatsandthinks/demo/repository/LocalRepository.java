package com.eatsandthinks.demo.repository;

import com.eatsandthinks.demo.entity.LocalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LocalRepository extends JpaRepository<LocalEntity, Long> {
    List<LocalEntity> findByTipoContainingIgnoreCase(String tipo);
    List<LocalEntity> findByNombreContainingIgnoreCase(String nombre);
    Optional<LocalEntity> findByPlaceId(String placeId);
    List<LocalEntity> findBySource(LocalEntity.Source source);
    List<LocalEntity> findByCreadoPorUsuarioId(Long userId);
}