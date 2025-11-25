package com.eatsandthinks.demo.repository;

import com.eatsandthinks.demo.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    
    // Obtener historial de búsquedas de un usuario ordenado por fecha descendente
    List<SearchHistory> findByUserIdOrderBySearchDateDesc(Long userId);
    
    // Obtener las últimas N búsquedas únicas de un usuario
    @Query(value = "SELECT DISTINCT sh.search_term FROM search_history sh WHERE sh.user_id = ?1 ORDER BY sh.search_date DESC", nativeQuery = true)
    List<String> findDistinctSearchTermsByUserId(Long userId);
}

