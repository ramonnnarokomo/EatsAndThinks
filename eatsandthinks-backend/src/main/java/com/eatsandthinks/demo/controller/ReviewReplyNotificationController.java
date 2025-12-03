package com.eatsandthinks.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.UserRepository;
import com.eatsandthinks.demo.service.ReviewReplyNotificationService;

@RestController
@RequestMapping("/api/notifications/review-replies")
public class ReviewReplyNotificationController {

    private final ReviewReplyNotificationService notificationService;
    private final UserRepository userRepository;

    public ReviewReplyNotificationController(ReviewReplyNotificationService notificationService,
                                             UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("unread", count));
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        List<ReviewReplyNotificationService.ReplyNotificationDTO> notifications = notificationService.getNotifications(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markNotificationsRead(@RequestBody MarkReadRequest request,
                                                   Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "No autenticado"));
        }
        notificationService.markAsRead(user.getId(), request.notificationIds(), request.markAll());
        return ResponseEntity.ok(Map.of("message", "Notificaciones actualizadas"));
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    public record MarkReadRequest(List<Long> notificationIds, boolean markAll) {}
}

