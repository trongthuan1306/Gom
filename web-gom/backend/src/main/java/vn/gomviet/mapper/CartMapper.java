package vn.gomviet.mapper;

import org.springframework.stereotype.Component;
import vn.gomviet.dto.CartDtos.CartItemResponse;
import vn.gomviet.dto.CartDtos.CartResponse;
import vn.gomviet.entity.Cart;
import vn.gomviet.entity.CartItem;
import vn.gomviet.entity.Product;

import java.math.BigDecimal;
import java.util.List;

@Component
public class CartMapper {

    public CartItemResponse toItemDto(CartItem item) {
        Product p = item.getProduct();
        BigDecimal unitPrice = p.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
        boolean available = p.isActive() && p.getStockQuantity() >= item.getQuantity();

        return new CartItemResponse(
            item.getId(),
            p.getId(),
            p.getName(),
            p.getSlug(),
            p.getImageUrl(),
            unitPrice,
            item.getQuantity(),
            subtotal,
            p.getStockQuantity(),
            available
        );
    }

    public CartResponse toDto(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
            .map(this::toItemDto)
            .toList();

        int totalQuantity = items.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal totalAmount = items.stream()
            .map(CartItemResponse::subtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalQuantity, totalAmount);
    }
}
