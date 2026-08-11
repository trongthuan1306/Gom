package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
