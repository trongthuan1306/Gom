package vn.gomviet.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public final class ChatDtos {
    private ChatDtos() {}

    public record Message(
        @NotBlank String role,
        @NotBlank @Size(max = 5000) String content,
        List<Recommendation> recommendations,
        String createdAt
    ) {}

    public record Request(
        String sessionToken,
        @NotEmpty @Size(max = 30) List<Message> messages
    ) {}

    public record Recommendation(
        Long productId,
        String reason,
        String name,
        Double price,
        String image,
        String season,
        String itemType
    ) {}

    public record Response(
        String sessionToken,
        String answer,
        List<Recommendation> recommendations
    ) {}

    public record HistoryResponse(
        String sessionToken,
        String title,
        List<Message> messages
    ) {}
}
