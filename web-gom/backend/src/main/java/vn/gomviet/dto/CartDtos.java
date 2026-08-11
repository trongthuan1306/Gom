package vn.gomviet.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public final class CartDtos {
    private CartDtos() {}

    public record CartResponse(
        List<CartItemResponse> items,
        int totalQuantity,
        BigDecimal totalAmount
    ) {}

    public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSlug,
        String productImage,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal subtotal,
        int stockQuantity,
        boolean available
    ) {}

    public record AddToCartRequest(
        @NotNull(message = "productId không được để trống")
        Long productId,

        @Min(value = 1, message = "Số lượng phải >= 1")
        int quantity
    ) {}

    public record UpdateCartItemRequest(
        @Min(value = 1, message = "Số lượng phải >= 1")
        int quantity
    ) {}

    public record MergeCartRequest(
        @NotNull(message = "Danh sách items không được null")
        @Valid
        List<MergeItem> items
    ) {}

    public record MergeItem(
        @NotNull(message = "productId không được để trống")
        Long productId,

        @Min(value = 1, message = "Số lượng phải >= 1")
        int quantity
    ) {}

    public record BatchProductRequest(
        @NotNull(message = "Danh sách ids không được null")
        @Size(min = 1, max = 50, message = "Số lượng ids phải từ 1 đến 50")
        List<Long> ids
    ) {}
}
