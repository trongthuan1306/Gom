package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.Cart;
import vn.gomviet.entity.CartItem;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    List<CartItem> findByCart(Cart cart);
    void deleteAllByCartId(Long cartId);
}
