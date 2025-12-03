package com.eatsandthinks.demo.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.entity.Review;
import com.eatsandthinks.demo.entity.ReviewReply;
import com.eatsandthinks.demo.entity.ReviewReplyNotification;
import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.ReviewReplyNotificationRepository;

@Service
public class ReviewReplyNotificationService {

    private final ReviewReplyNotificationRepository notificationRepository;
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Europe/Madrid");

    public ReviewReplyNotificationService(ReviewReplyNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notifyReviewAuthor(Review review, ReviewReply reply, User responder, LocalEntity local) {
        if (review == null || reply == null || responder == null) {
            return;
        }
        if (review.getUserId() != null && review.getUserId().equals(responder.getId())) {
            // No notificar si responde a su propia reseña
            return;
        }
        ReviewReplyNotification notification = new ReviewReplyNotification();
        notification.setUserId(review.getUserId());
        notification.setReviewId(review.getId());
        notification.setReplyId(reply.getId());
        notification.setResponderId(responder.getId());
        notification.setResponderName(responder.getNombre());
        notification.setPlaceId(local != null ? local.getPlaceId() : null);
        notification.setPlaceName(local != null ? local.getNombre() : null);
        notification.setReviewSnippet(buildSnippet(review.getComentario()));
        notification.setReplySnippet(buildSnippet(reply.getContent()));
        notification.setCreatedAt(LocalDateTime.now(DEFAULT_ZONE));
        notificationRepository.save(notification);
    }

    public long getUnreadCount(Long userId) {
        if (userId == null) return 0;
        return notificationRepository.countByUserIdAndReadFlagFalse(userId);
    }

    public List<ReplyNotificationDTO> getNotifications(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long userId, List<Long> notificationIds, boolean markAll) {
        if (userId == null) return;
        List<ReviewReplyNotification> notifications;
        if (markAll) {
            notifications = notificationRepository.findByUserIdAndReadFlagFalse(userId);
        } else if (notificationIds != null && !notificationIds.isEmpty()) {
            notifications = notificationRepository.findByIdInAndUserId(notificationIds, userId);
        } else {
            return;
        }
        notifications.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(notifications);
    }

    private ReplyNotificationDTO mapToDto(ReviewReplyNotification notification) {
        return new ReplyNotificationDTO(
            notification.getId(),
            notification.getReviewId(),
            notification.getReplyId(),
            notification.getResponderName(),
            notification.getReplySnippet(),
            notification.getPlaceId(),
            notification.getPlaceName(),
            notification.getReviewSnippet(),
            notification.isReadFlag(),
            notification.getCreatedAt()
        );
    }

    private String buildSnippet(String value) {
        if (value == null) {
            return "";
        }
        final int max = 160;
        return value.length() <= max ? value : value.substring(0, max).concat("…");
    }

    public record ReplyNotificationDTO(
        Long id,
        Long reviewId,
        Long replyId,
        String responderName,
        String replySnippet,
        String placeId,
        String placeName,
        String reviewSnippet,
        boolean read,
        LocalDateTime createdAt
    ) {}
}

