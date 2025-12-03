package com.eatsandthinks.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.service.ReviewReplyService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewReplyController {

    private final ReviewReplyService reviewReplyService;
    private final UserRepository userRepository;

    public ReviewReplyController(ReviewReplyService reviewReplyService,
                                 UserRepository userRepository) {
        this.reviewReplyService = reviewReplyService;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/reviews/{reviewId}/replies
     */
    @PostMapping("/{reviewId}/replies")
    public ResponseEntity<?> createReply(@PathVariable Long reviewId,
                                         @RequestBody ReplyRequest request,
                                         Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("message", "Debes iniciar sesión"));
            }
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (Boolean.TRUE.equals(user.getBanned())) {
                return ResponseEntity.status(403).body(Map.of("message", "Tu cuenta ha sido suspendida"));
            }
            if (!Boolean.TRUE.equals(user.getCanReview())) {
                return ResponseEntity.status(403).body(Map.of("message", "No tienes permisos para responder"));
            }

            var reply = reviewReplyService.createReply(reviewId, new ReviewReplyService.ReplyCreationDTO(request.content()), user.getId());
            return ResponseEntity.status(201).body(reply);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al responder reseña"));
        }
    }

    /**
     * GET /api/reviews/{reviewId}/replies
     */
    @GetMapping("/{reviewId}/replies")
    public ResponseEntity<List<ReviewReplyService.ReplyDTO>> getReplies(@PathVariable Long reviewId) {
        List<ReviewReplyService.ReplyDTO> replies = reviewReplyService.getReplies(reviewId);
        return ResponseEntity.ok(replies);
    }

    public record ReplyRequest(String content) {}
}

