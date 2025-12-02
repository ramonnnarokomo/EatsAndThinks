package com.eatsandthinks.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eatsandthinks.demo.entity.ReviewReplyNotification;

public interface ReviewReplyNotificationRepository extends JpaRepository<ReviewReplyNotification, Long> {

    long countByUserIdAndReadFlagFalse(Long userId);

    List<ReviewReplyNotification> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);

    List<ReviewReplyNotification> findByUserIdAndReadFlagFalse(Long userId);

    List<ReviewReplyNotification> findByIdInAndUserId(List<Long> ids, Long userId);
}

