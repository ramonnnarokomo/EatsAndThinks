package com.eatsandthinks.demo.repository;

import com.eatsandthinks.demo.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByLocalId(Long localId);
    List<Review> findByUserId(Long userId);
}
