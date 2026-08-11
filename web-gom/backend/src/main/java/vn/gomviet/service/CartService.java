package vn.gomviet.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.gomviet.dto.CartDtos.*;
import vn.gomviet.entity.Cart;
import vn.gomviet.entity.CartItem;
import vn.gomviet.entity.Product;
import vn.gomviet.entity.User;
import vn.gomviet.exception.ApiException;
import vn.gomviet.mapper.CartMapper;
import vn.gomviet.repository.CartItemRepository;
import vn.gomviet.repository.CartRepository;
import vn.gomviet.repository.ProductRepository;
import vn.gomviet.repository.UserRepository;

import java.time.Instant;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final CartMapper mapper;

    public CartService(CartRepository cartRepo, CartItemRepository itemRepo,
                       ProductRepository productRepo, UserRepository userRepo,
                       CartMapper mapper) {
        this.cartRepo = cartRepo;
        this.itemRepo = itemRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return mapper.toDto(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddToCartRequest request) {
        Cart cart = getOrCreateCart(email);
        Product product = findActiveProduct(request.productId());

        int requestedQty = request.quantity();
        Optional<CartItem> existing = itemRepo.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + requestedQty;
            newQty = Math.min(newQty, product.getStockQuantity());
            if (newQty < 1) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
            }
            item.setQuantity(newQty);
            item.setUpdatedAt(Instant.now());
        } else {
            int qty = Math.min(requestedQty, product.getStockQuantity());
            if (qty < 1) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
            }
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(qty);
            cart.getItems().add(item);
        }

        cart.setUpdatedAt(Instant.now());
        cartRepo.save(cart);
        return mapper.toDto(cart);
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findOwnedItem(cart, itemId);

        int newQty = Math.min(request.quantity(), item.getProduct().getStockQuantity());
        if (newQty < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
        }
        item.setQuantity(newQty);
        item.setUpdatedAt(Instant.now());
        cart.setUpdatedAt(Instant.now());
        cartRepo.save(cart);
        return mapper.toDto(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findOwnedItem(cart, itemId);
        cart.getItems().remove(item);
        cart.setUpdatedAt(Instant.now());
        cartRepo.save(cart);
        return mapper.toDto(cart);
    }

    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        cart.setUpdatedAt(Instant.now());
        cartRepo.save(cart);
        return mapper.toDto(cart);
    }

    @Transactional
    public CartResponse mergeCart(String email, MergeCartRequest request) {
        Cart cart = getOrCreateCart(email);

        for (MergeItem mi : request.items()) {
            Product product;
            try {
                product = findActiveProduct(mi.productId());
            } catch (ApiException e) {
                // Bỏ qua sản phẩm không tồn tại hoặc inactive khi merge
                continue;
            }

            Optional<CartItem> existing = itemRepo.findByCartIdAndProductId(cart.getId(), product.getId());
            if (existing.isPresent()) {
                CartItem item = existing.get();
                int newQty = item.getQuantity() + mi.quantity();
                newQty = Math.min(newQty, product.getStockQuantity());
                if (newQty >= 1) {
                    item.setQuantity(newQty);
                    item.setUpdatedAt(Instant.now());
                }
            } else {
                int qty = Math.min(mi.quantity(), product.getStockQuantity());
                if (qty >= 1) {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setProduct(product);
                    item.setQuantity(qty);
                    cart.getItems().add(item);
                }
            }
        }

        cart.setUpdatedAt(Instant.now());
        cartRepo.save(cart);
        return mapper.toDto(cart);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Cart getOrCreateCart(String email) {
        User user = userRepo.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        return cartRepo.findByUserId(user.getId()).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(user);
            return cartRepo.save(c);
        });
    }

    private Product findActiveProduct(Long productId) {
        Product p = productRepo.findById(productId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));
        if (!p.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm đã ngừng bán");
        }
        return p;
    }

    private CartItem findOwnedItem(Cart cart, Long itemId) {
        return cart.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm trong giỏ hàng"));
    }
}
