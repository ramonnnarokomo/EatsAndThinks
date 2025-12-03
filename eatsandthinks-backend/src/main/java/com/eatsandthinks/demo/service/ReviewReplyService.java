package com.eatsandthinks.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eatsandthinks.demo.entity.LocalEntity;
import com.eatsandthinks.demo.entity.Review;
import com.eatsandthinks.demo.entity.ReviewReply;
import com.eatsandthinks.demo.entity.User;
import com.eatsandthinks.demo.repository.LocalRepository;
import com.eatsandthinks.demo.repository.ReviewReplyRepository;
import com.eatsandthinks.demo.repository.ReviewRepository;
import com.eatsandthinks.demo.repository.UserRepository;

@Service
public class ReviewReplyService {

    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final LocalRepository localRepository;
    private final ReviewReplyNotificationService notificationService;

    public ReviewReplyService(ReviewReplyRepository reviewReplyRepository,
                              ReviewRepository reviewRepository,
                              UserRepository userRepository,
                              LocalRepository localRepository,
                              ReviewReplyNotificationService notificationService) {
        this.reviewReplyRepository = reviewReplyRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.localRepository = localRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReplyDTO createReply(Long reviewId, ReplyCreationDTO dto, Long authorId) {
        if (dto == null || dto.content() == null || dto.content().trim().length() < 2) {
            throw new RuntimeException("La respuesta es demasiado corta");
        }
        if (dto.content().length() > 2000) {
            throw new RuntimeException("La respuesta excede el límite permitido");
        }
        String sanitizedContent = dto.content().trim();
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));

        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.TRUE.equals(author.getBanned())) {
            throw new RuntimeException("Tu cuenta ha sido suspendida");
        }
        if (!Boolean.TRUE.equals(author.getCanReview())) {
            throw new RuntimeException("No tienes permisos para responder reseñas");
        }

        ReviewReply reply = new ReviewReply();
        reply.setReviewId(reviewId);
        reply.setAuthorId(authorId);
        reply.setContent(sanitizedContent);
        reply.setCreatedAt(LocalDateTime.now());

        ReviewReply savedReply = reviewReplyRepository.save(reply);

        LocalEntity local = localRepository.findById(review.getLocalId()).orElse(null);
        notificationService.notifyReviewAuthor(review, savedReply, author, local);

        return mapToDto(savedReply, author);
    }

    public List<ReplyDTO> getReplies(Long reviewId) {
        return reviewReplyRepository.findByReviewIdOrderByCreatedAtAsc(reviewId)
            .stream()
            .map(reply -> {
                User author = userRepository.findById(reply.getAuthorId()).orElse(null);
                return mapToDto(reply, author);
            })
            .collect(Collectors.toList());
    }

    private ReplyDTO mapToDto(ReviewReply reply, User author) {
        return new ReplyDTO(
            reply.getId(),
            reply.getReviewId(),
            reply.getAuthorId(),
            author != null ? author.getNombre() : "Usuario",
            reply.getContent(),
            reply.getCreatedAt(),
            author != null ? author.getProfileImageUrl() : null
        );
    }

    public record ReplyCreationDTO(String content) {}

    public record ReplyDTO(
        Long replyId,
        Long reviewId,
        Long authorId,
        String authorName,
        String content,
        LocalDateTime createdAt,
        String authorAvatarUrl
    ) {}
}

