package com.eatsandthinks.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eatsandthinks.demo.entity.ReviewReply;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {

    List<ReviewReply> findByReviewIdOrderByCreatedAtAsc(Long reviewId);

    long countByReviewId(Long reviewId);
}

