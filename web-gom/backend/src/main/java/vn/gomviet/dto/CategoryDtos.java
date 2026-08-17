package vn.gomviet.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryDtos {

    public record CategoryRequest(
            @NotBlank(message = "Tên bộ sưu tập không được để trống")
            String name,
            String slug,
            String description,
            String season,
            String flower,
            String flowerIcon,
            String meaning,
            String imageUrl
    ) {}

    public record CategoryResponse(
            Long id,
            String name,
            String slug,
            String description,
            String season,
            String flower,
            String flowerIcon,
            String meaning,
            String imageUrl
    ) {}
}
