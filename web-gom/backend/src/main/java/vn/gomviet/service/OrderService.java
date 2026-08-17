package vn.gomviet.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.gomviet.dto.OrderDtos;
import vn.gomviet.entity.*;
import vn.gomviet.exception.ApiException;
import vn.gomviet.repository.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    private final UserRepository userRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final PaymentRepository paymentRepo;
    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final ProductRepository productRepo;
    private final ProvinceRepository provinceRepo;
    private final WardRepository wardRepo;
    private final VNPayService vnPayService;
    private final ObjectMapper objectMapper;

    public OrderService(UserRepository userRepo,
                        OrderRepository orderRepo,
                        OrderItemRepository orderItemRepo,
                        PaymentRepository paymentRepo,
                        CartRepository cartRepo,
                        CartItemRepository cartItemRepo,
                        ProductRepository productRepo,
                        ProvinceRepository provinceRepo,
                        WardRepository wardRepo,
                        VNPayService vnPayService,
                        ObjectMapper objectMapper) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.paymentRepo = paymentRepo;
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.productRepo = productRepo;
        this.provinceRepo = provinceRepo;
        this.wardRepo = wardRepo;
        this.vnPayService = vnPayService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderDtos.CheckoutResponse createOrder(String userEmail, OrderDtos.CheckoutRequest req, String clientIp) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
        return createOrder(user, req, clientIp);
    }

    @Transactional
    public OrderDtos.CheckoutResponse createOrder(User user, OrderDtos.CheckoutRequest req, String clientIp) {
        // 1. Fetch user's cart
        Cart cart = cartRepo.findByUser(user)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống"));

        List<CartItem> cartItems = cartItemRepo.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống");
        }

        // 2. Resolve address names
        Province province = provinceRepo.findById(req.getProvinceCode())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Tỉnh/Thành phố không hợp lệ"));
        Ward ward = wardRepo.findById(req.getWardCode())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Phường/Xã không hợp lệ"));

        String fullAddress = req.getDetailAddress().trim() + ", " + ward.getFullName() + ", " + province.getFullName();

        // 3. Calculate total amount & build order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            if (!product.getActive()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm '" + product.getName() + "' hiện không còn kinh doanh");
            }
            if (product.getStockQuantity() < ci.getQuantity()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Sản phẩm '" + product.getName() + "' chỉ còn " + product.getStockQuantity() + " sản phẩm trong kho");
            }

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - ci.getQuantity());
            productRepo.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(ci.getQuantity());
            orderItems.add(orderItem);
        }

        // 4. Create Order
        Order order = new Order();
        order.setUser(user);
        order.setRecipientName(req.getRecipientName().trim());
        order.setPhone(req.getPhone().trim());
        order.setShippingAddress(fullAddress);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);

        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepo.save(order);

        // 5. Create Payment record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        String provider = req.getPaymentMethod().toUpperCase();
        payment.setProvider(provider);
        payment.setAmount(totalAmount);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepo.save(payment);

        // 6. Clear user cart
        cartItemRepo.deleteAll(cartItems);

        // 7. Handle payment method response
        if ("VNPAY".equalsIgnoreCase(provider)) {
            String paymentUrl = vnPayService.createPaymentUrl(savedOrder, clientIp);
            return new OrderDtos.CheckoutResponse(
                    savedOrder.getId(),
                    savedOrder.getStatus().name(),
                    "VNPAY",
                    paymentUrl,
                    totalAmount,
                    "Khởi tạo thanh toán VNPAY thành công"
            );
        } else {
            // COD
            return new OrderDtos.CheckoutResponse(
                    savedOrder.getId(),
                    savedOrder.getStatus().name(),
                    "COD",
                    null,
                    totalAmount,
                    "Đặt hàng thành công! Vui lòng thanh toán bằng tiền mặt khi nhận hàng."
            );
        }
    }

    @Transactional
    public Map<String, Object> verifyAndProcessVnPayReturn(Map<String, String> params) {
        boolean isValidHash = vnPayService.verifyReturn(params);
        if (!isValidHash) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chữ ký VNPAY không hợp lệ");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        Long orderId;
        try {
            orderId = Long.parseLong(txnRef);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã đơn hàng VNPAY không hợp lệ");
        }

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng #" + orderId));

        Payment payment = paymentRepo.findByOrder(order)
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    p.setProvider("VNPAY");
                    p.setAmount(order.getTotalAmount());
                    return p;
                });

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("totalAmount", order.getTotalAmount());
        result.put("responseCode", responseCode);

        String payloadJson = null;
        try {
            payloadJson = objectMapper.writeValueAsString(params);
        } catch (Exception e) {
            payloadJson = null;
        }

        if ("00".equals(responseCode)) {
            order.setStatus(OrderStatus.CONFIRMED);
            payment.setStatus(PaymentStatus.PAID);
            payment.setTransactionRef(transactionNo);
            payment.setProviderPayload(payloadJson);

            orderRepo.save(order);
            paymentRepo.save(payment);

            result.put("success", true);
            result.put("message", "Thanh toán VNPAY thành công!");
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setProviderPayload(payloadJson);
            order.setStatus(OrderStatus.CANCELLED);

            orderRepo.save(order);
            paymentRepo.save(payment);

            result.put("success", false);
            result.put("message", "Thanh toán VNPAY không thành công (Mã lỗi: " + responseCode + ")");
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> getUserOrders(String userEmail) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
        return getUserOrders(user);
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> getUserOrders(User user) {
        List<Order> orders = orderRepo.findByUserOrderByCreatedAtDesc(user);
        return orders.stream().map(this::toOrderResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderResponse getOrderById(String userEmail, Long orderId) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
        return getOrderById(user, orderId);
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderResponse getOrderById(User user, Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng #" + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập đơn hàng này");
        }
        return toOrderResponse(order);
    }

    @Transactional
    public OrderDtos.OrderResponse cancelOrder(String userEmail, Long orderId) {
        User user = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng #" + orderId));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.COMPLETED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Shipper đã lấy hàng hoặc đơn hàng đã hoàn thành, bạn không thể hủy đơn hàng này");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Đơn hàng này đã được hủy trước đó");
        }

        // Restore stock for all order items
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepo.save(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepo.save(order);

        paymentRepo.findByOrder(order).ifPresent(p -> {
            p.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(p);
        });

        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDtos.OrderResponse> getAllOrdersForStaff(String statusStr) {
        List<Order> orders;
        if (statusStr != null && !statusStr.isBlank() && !"ALL".equalsIgnoreCase(statusStr.trim())) {
            try {
                OrderStatus status = OrderStatus.valueOf(statusStr.trim().toUpperCase());
                orders = orderRepo.findByStatusOrderByCreatedAtDesc(status);
            } catch (IllegalArgumentException e) {
                orders = orderRepo.findAllByOrderByCreatedAtDesc();
            }
        } else {
            orders = orderRepo.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(this::toOrderResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderResponse getOrderByIdForStaff(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng #" + orderId));
        return toOrderResponse(order);
    }

    @Transactional
    public OrderDtos.OrderResponse updateOrderStatusByStaff(Long orderId, String newStatusStr) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng #" + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(newStatusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ: " + newStatusStr);
        }

        OrderStatus oldStatus = order.getStatus();
        if (oldStatus == newStatus) {
            return toOrderResponse(order);
        }

        // If cancelling, restore stock
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepo.save(product);
                }
            }
            paymentRepo.findByOrder(order).ifPresent(p -> {
                p.setStatus(PaymentStatus.FAILED);
                paymentRepo.save(p);
            });
        }

        // If completing, update payment to PAID if COD
        if (newStatus == OrderStatus.COMPLETED) {
            paymentRepo.findByOrder(order).ifPresent(p -> {
                if (p.getStatus() != PaymentStatus.PAID) {
                    p.setStatus(PaymentStatus.PAID);
                    paymentRepo.save(p);
                }
            });
        }

        order.setStatus(newStatus);
        orderRepo.save(order);

        return toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderDtos.DashboardStatsResponse getDashboardStats() {
        OrderDtos.DashboardStatsResponse stats = new OrderDtos.DashboardStatsResponse();

        stats.setTotalRevenue(orderRepo.calculateTotalEffectiveRevenue());
        stats.setTotalOrders(orderRepo.count());
        stats.setPendingOrders(orderRepo.countByStatus(OrderStatus.PENDING));
        stats.setConfirmedOrders(orderRepo.countByStatus(OrderStatus.CONFIRMED));
        stats.setShippingOrders(orderRepo.countByStatus(OrderStatus.SHIPPING));
        stats.setCompletedOrders(orderRepo.countByStatus(OrderStatus.COMPLETED));
        stats.setCancelledOrders(orderRepo.countByStatus(OrderStatus.CANCELLED));

        stats.setTotalCustomers(userRepo.countByRole(Role.CUSTOMER));
        stats.setTotalProducts(productRepo.countByActiveTrue());
        stats.setLowStockProducts(productRepo.countByStockQuantityLessThanEqualAndActiveTrue(5));

        // Timezone & Date boundaries (Vietnam UTC+7)
        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        Instant startOfToday = now.toLocalDate().atStartOfDay(zoneId).toInstant();
        Instant endOfToday = now.toLocalDate().plusDays(1).atStartOfDay(zoneId).toInstant();
        Instant startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay(zoneId).toInstant();

        // Today & This month stats
        BigDecimal todayRev = orderRepo.calculateEffectiveRevenueBetween(startOfToday, endOfToday);
        stats.setTodayRevenue(todayRev != null ? todayRev : BigDecimal.ZERO);
        stats.setTodayOrders(orderRepo.countByCreatedAtBetween(startOfToday, endOfToday));

        BigDecimal monthRev = orderRepo.calculateEffectiveRevenueBetween(startOfMonth, endOfToday);
        stats.setThisMonthRevenue(monthRev != null ? monthRev : BigDecimal.ZERO);
        stats.setThisMonthOrders(orderRepo.countByCreatedAtBetween(startOfMonth, endOfToday));

        // Daily revenue for the last 7 days
        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM");
        List<OrderDtos.DailyRevenueDto> dailyList = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = now.toLocalDate().minusDays(i);
            Instant dStart = day.atStartOfDay(zoneId).toInstant();
            Instant dEnd = day.plusDays(1).atStartOfDay(zoneId).toInstant();
            BigDecimal dRev = orderRepo.calculateEffectiveRevenueBetween(dStart, dEnd);
            long dOrders = orderRepo.countByCreatedAtBetween(dStart, dEnd);
            dailyList.add(new OrderDtos.DailyRevenueDto(day.format(df), dRev != null ? dRev : BigDecimal.ZERO, dOrders));
        }
        stats.setDailyRevenues(dailyList);

        // Effective orders for top selling products & payment method calculation
        List<Order> effectiveOrders = orderRepo.findAllEffectiveOrders();
        Map<Long, OrderDtos.TopSellingProductDto> productSalesMap = new HashMap<>();
        long codCount = 0;
        long vnpayCount = 0;
        BigDecimal codRev = BigDecimal.ZERO;
        BigDecimal vnpayRev = BigDecimal.ZERO;

        for (Order o : effectiveOrders) {
            // Payment method breakdown
            Optional<Payment> pOpt = paymentRepo.findByOrder(o);
            String provider = pOpt.map(Payment::getProvider).orElse("COD");
            if ("VNPAY".equalsIgnoreCase(provider)) {
                vnpayCount++;
                vnpayRev = vnpayRev.add(o.getTotalAmount());
            } else {
                codCount++;
                codRev = codRev.add(o.getTotalAmount());
            }

            // Top products breakdown
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getProduct() != null) {
                        Long pId = item.getProduct().getId();
                        BigDecimal itemAmount = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                        productSalesMap.compute(pId, (k, existing) -> {
                            if (existing == null) {
                                return new OrderDtos.TopSellingProductDto(
                                        pId,
                                        item.getProductName(),
                                        item.getProduct().getImageUrl(),
                                        item.getQuantity(),
                                        itemAmount
                                );
                            } else {
                                existing.setTotalQuantitySold(existing.getTotalQuantitySold() + item.getQuantity());
                                existing.setTotalRevenue(existing.getTotalRevenue().add(itemAmount));
                                return existing;
                            }
                        });
                    }
                }
            }
        }

        stats.setCodOrdersCount(codCount);
        stats.setVnpayOrdersCount(vnpayCount);
        stats.setCodRevenue(codRev);
        stats.setVnpayRevenue(vnpayRev);

        // Sort top selling products by quantity sold
        List<OrderDtos.TopSellingProductDto> topProducts = productSalesMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getTotalQuantitySold(), a.getTotalQuantitySold()))
                .limit(6)
                .toList();
        stats.setTopSellingProducts(topProducts);

        // Low stock products list (<= 5)
        List<Product> lowStock = productRepo.findByActiveTrueAndStockQuantityLessThanEqualOrderByStockQuantityAsc(5);
        List<OrderDtos.LowStockProductDto> lowStockList = lowStock.stream().map(p ->
                new OrderDtos.LowStockProductDto(
                        p.getId(),
                        p.getName(),
                        p.getImageUrl(),
                        p.getPrice(),
                        p.getStockQuantity()
                )
        ).toList();
        stats.setLowStockProductList(lowStockList);

        // Recent orders
        List<Order> recent = orderRepo.findAllByOrderByCreatedAtDesc();
        stats.setRecentOrders(recent.stream().limit(8).map(this::toOrderResponse).toList());

        return stats;
    }

    private OrderDtos.OrderResponse toOrderResponse(Order order) {
        OrderDtos.OrderResponse dto = new OrderDtos.OrderResponse();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus().name());
        dto.setRecipientName(order.getRecipientName());
        dto.setPhone(order.getPhone());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setCreatedAt(order.getCreatedAt());

        paymentRepo.findByOrder(order).ifPresent(p -> {
            dto.setPaymentProvider(p.getProvider());
            dto.setPaymentStatus(p.getStatus().name());
        });

        List<OrderDtos.OrderItemResponse> itemDtos = order.getItems().stream().map(item ->
                new OrderDtos.OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getProduct() != null ? item.getProduct().getImageUrl() : null,
                        item.getUnitPrice(),
                        item.getQuantity()
                )
        ).toList();

        dto.setItems(itemDtos);
        return dto;
    }
}
