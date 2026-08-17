package vn.gomviet.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductDto(
    Long id,
    String slug,
    String name,
    String description,
    BigDecimal price,
    int stockQuantity,
    String imageUrl,
    String materials,
    String dimensions,
    String origin,
    String careInstructions,
    String itemType,
    String flowerType,
    String season
) {
    public record CreateProductRequest(
        @NotBlank(message = "Tên sản phẩm không được để trống")
        String name,

        String slug,

        String description,

        @NotNull(message = "Giá sản phẩm không được để trống")
        @DecimalMin(value = "0.0", message = "Giá sản phẩm phải >= 0")
        BigDecimal price,

        @Min(value = 0, message = "Số lượng kho phải >= 0")
        int stockQuantity,

        String materials,
        String dimensions,
        String origin,
        String careInstructions,
        String itemType,
        String flowerType,
        String season
    ) {}

    public record UpdateProductRequest(
        @NotBlank(message = "Tên sản phẩm không được để trống")
        String name,

        String slug,

        String description,

        @NotNull(message = "Giá sản phẩm không được để trống")
        @DecimalMin(value = "0.0", message = "Giá sản phẩm phải >= 0")
        BigDecimal price,

        @Min(value = 0, message = "Số lượng kho phải >= 0")
        int stockQuantity,

        String materials,
        String dimensions,
        String origin,
        String careInstructions,
        String itemType,
        String flowerType,
        String season
    ) {}
}
