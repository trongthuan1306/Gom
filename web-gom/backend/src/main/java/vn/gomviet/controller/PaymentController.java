package vn.gomviet.controller;

import org.springframework.web.bind.annotation.*;
import vn.gomviet.service.OrderService;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderService orderService;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/vnpay-return")
    public Map<String, Object> vnPayReturn(@RequestParam Map<String, String> allParams) {
        return orderService.verifyAndProcessVnPayReturn(allParams);
    }
}
