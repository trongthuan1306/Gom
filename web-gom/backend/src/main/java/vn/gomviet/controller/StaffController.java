package vn.gomviet.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import vn.gomviet.dto.OrderDtos;
import vn.gomviet.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final OrderService orderService;

    public StaffController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/status")
    public java.util.Map<String, String> status() {
        return java.util.Map.of("scope", "STAFF_OR_ADMIN", "status", "ready");
    }

    @GetMapping("/orders")
    public List<OrderDtos.OrderResponse> getAllOrders(@RequestParam(value = "status", required = false) String status) {
        return orderService.getAllOrdersForStaff(status);
    }

    @GetMapping("/orders/{id}")
    public OrderDtos.OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderByIdForStaff(id);
    }

    @PutMapping("/orders/{id}/status")
    public OrderDtos.OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderDtos.UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatusByStaff(id, request.getStatus());
    }

    @GetMapping("/dashboard/stats")
    public OrderDtos.DashboardStatsResponse getDashboardStats() {
        return orderService.getDashboardStats();
    }
}
