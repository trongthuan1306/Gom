package vn.gomviet.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.gomviet.dto.OrderDtos.*;
import vn.gomviet.security.VNPayUtil;
import vn.gomviet.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@AuthenticationPrincipal UserDetails user,
                                     @Valid @RequestBody CheckoutRequest request,
                                     HttpServletRequest servletRequest) {
        String clientIp = VNPayUtil.getIpAddress(servletRequest);
        return orderService.createOrder(user.getUsername(), request, clientIp);
    }

    @GetMapping
    public List<OrderResponse> getMyOrders(@AuthenticationPrincipal UserDetails user) {
        return orderService.getUserOrders(user.getUsername());
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@AuthenticationPrincipal UserDetails user,
                                       @PathVariable Long id) {
        return orderService.getOrderById(user.getUsername(), id);
    }

    @PutMapping("/{id}/cancel")
    public OrderResponse cancelOrder(@AuthenticationPrincipal UserDetails user,
                                     @PathVariable Long id) {
        return orderService.cancelOrder(user.getUsername(), id);
    }
}
