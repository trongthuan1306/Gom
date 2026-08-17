package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.gomviet.entity.Order;
import vn.gomviet.entity.OrderStatus;
import vn.gomviet.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = vn.gomviet.entity.OrderStatus.COMPLETED")
    BigDecimal calculateTotalCompletedRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN (vn.gomviet.entity.OrderStatus.CONFIRMED, vn.gomviet.entity.OrderStatus.SHIPPING, vn.gomviet.entity.OrderStatus.COMPLETED)")
    BigDecimal calculateTotalEffectiveRevenue();

    // ── Reporting queries ──

    List<Order> findByCreatedAtBetweenOrderByCreatedAtAsc(Instant start, Instant end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN (vn.gomviet.entity.OrderStatus.CONFIRMED, vn.gomviet.entity.OrderStatus.SHIPPING, vn.gomviet.entity.OrderStatus.COMPLETED) AND o.createdAt BETWEEN :start AND :end")
    BigDecimal calculateEffectiveRevenueBetween(@Param("start") Instant start, @Param("end") Instant end);

    long countByCreatedAtBetween(Instant start, Instant end);

    long countByStatusAndCreatedAtBetween(OrderStatus status, Instant start, Instant end);

    @Query("SELECT o FROM Order o WHERE o.status IN (vn.gomviet.entity.OrderStatus.CONFIRMED, vn.gomviet.entity.OrderStatus.SHIPPING, vn.gomviet.entity.OrderStatus.COMPLETED)")
    List<Order> findAllEffectiveOrders();

    @Query("SELECT o FROM Order o WHERE o.status IN (vn.gomviet.entity.OrderStatus.CONFIRMED, vn.gomviet.entity.OrderStatus.SHIPPING, vn.gomviet.entity.OrderStatus.COMPLETED) AND o.createdAt >= :since")
    List<Order> findEffectiveOrdersSince(@Param("since") Instant since);
}

