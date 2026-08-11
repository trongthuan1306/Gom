package vn.gomviet.controller;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.gomviet.dto.CartDtos.*;
import vn.gomviet.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal UserDetails user) {
        return service.getCart(user.getUsername());
    }

    @PostMapping("/items")
    public CartResponse addItem(@AuthenticationPrincipal UserDetails user,
                                @Valid @RequestBody AddToCartRequest request) {
        return service.addItem(user.getUsername(), request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(@AuthenticationPrincipal UserDetails user,
                                   @PathVariable Long itemId,
                                   @Valid @RequestBody UpdateCartItemRequest request) {
        return service.updateItem(user.getUsername(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@AuthenticationPrincipal UserDetails user,
                                   @PathVariable Long itemId) {
        return service.removeItem(user.getUsername(), itemId);
    }

    @DeleteMapping
    public CartResponse clearCart(@AuthenticationPrincipal UserDetails user) {
        return service.clearCart(user.getUsername());
    }

    @PostMapping("/merge")
    public CartResponse mergeCart(@AuthenticationPrincipal UserDetails user,
                                 @Valid @RequestBody MergeCartRequest request) {
        return service.mergeCart(user.getUsername(), request);
    }
}
