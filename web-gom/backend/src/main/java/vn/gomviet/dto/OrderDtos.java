package vn.gomviet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDtos {

    public static class CheckoutRequest {
        @NotBlank(message = "Tên người nhận không được để trống")
        private String recipientName;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String phone;

        @NotBlank(message = "Tỉnh/Thành phố không được để trống")
        private String provinceCode;

        @NotBlank(message = "Phường/Xã không được để trống")
        private String wardCode;

        @NotBlank(message = "Địa chỉ chi tiết không được để trống")
        private String detailAddress;

        @NotBlank(message = "Phương thức thanh toán không được để trống")
        private String paymentMethod; // "COD" or "VNPAY"

        private String notes;

        public CheckoutRequest() {
        }

        public String getRecipientName() {
            return recipientName;
        }

        public void setRecipientName(String recipientName) {
            this.recipientName = recipientName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getProvinceCode() {
            return provinceCode;
        }

        public void setProvinceCode(String provinceCode) {
            this.provinceCode = provinceCode;
        }

        public String getWardCode() {
            return wardCode;
        }

        public void setWardCode(String wardCode) {
            this.wardCode = wardCode;
        }

        public String getDetailAddress() {
            return detailAddress;
        }

        public void setDetailAddress(String detailAddress) {
            this.detailAddress = detailAddress;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class CheckoutResponse {
        private Long orderId;
        private String status;
        private String paymentMethod;
        private String paymentUrl;
        private BigDecimal totalAmount;
        private String message;

        public CheckoutResponse() {
        }

        public CheckoutResponse(Long orderId, String status, String paymentMethod, String paymentUrl, BigDecimal totalAmount, String message) {
            this.orderId = orderId;
            this.status = status;
            this.paymentMethod = paymentMethod;
            this.paymentUrl = paymentUrl;
            this.totalAmount = totalAmount;
            this.message = message;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getPaymentUrl() {
            return paymentUrl;
        }

        public void setPaymentUrl(String paymentUrl) {
            this.paymentUrl = paymentUrl;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal unitPrice;
        private Integer quantity;

        public OrderItemResponse() {
        }

        public OrderItemResponse(Long id, Long productId, String productName, String productImageUrl, BigDecimal unitPrice, Integer quantity) {
            this.id = id;
            this.productId = productId;
            this.productName = productName;
            this.productImageUrl = productImageUrl;
            this.unitPrice = unitPrice;
            this.quantity = quantity;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getProductImageUrl() {
            return productImageUrl;
        }

        public void setProductImageUrl(String productImageUrl) {
            this.productImageUrl = productImageUrl;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class OrderResponse {
        private Long id;
        private String status;
        private String recipientName;
        private String phone;
        private String shippingAddress;
        private BigDecimal totalAmount;
        private Instant createdAt;
        private String paymentProvider;
        private String paymentStatus;
        private List<OrderItemResponse> items;

        public OrderResponse() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getRecipientName() {
            return recipientName;
        }

        public void setRecipientName(String recipientName) {
            this.recipientName = recipientName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public String getPaymentProvider() {
            return paymentProvider;
        }

        public void setPaymentProvider(String paymentProvider) {
            this.paymentProvider = paymentProvider;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public List<OrderItemResponse> getItems() {
            return items;
        }

        public void setItems(List<OrderItemResponse> items) {
            this.items = items;
        }
    }

    public static class UpdateOrderStatusRequest {
        @NotBlank(message = "Trạng thái đơn hàng không được để trống")
        private String status;

        public UpdateOrderStatusRequest() {}

        public UpdateOrderStatusRequest(String status) {
            this.status = status;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class DailyRevenueDto {
        private String date;
        private BigDecimal revenue;
        private long orderCount;

        public DailyRevenueDto() {}

        public DailyRevenueDto(String date, BigDecimal revenue, long orderCount) {
            this.date = date;
            this.revenue = revenue;
            this.orderCount = orderCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public long getOrderCount() {
            return orderCount;
        }

        public void setOrderCount(long orderCount) {
            this.orderCount = orderCount;
        }
    }

    public static class TopSellingProductDto {
        private Long productId;
        private String productName;
        private String imageUrl;
        private long totalQuantitySold;
        private BigDecimal totalRevenue;

        public TopSellingProductDto() {}

        public TopSellingProductDto(Long productId, String productName, String imageUrl, long totalQuantitySold, BigDecimal totalRevenue) {
            this.productId = productId;
            this.productName = productName;
            this.imageUrl = imageUrl;
            this.totalQuantitySold = totalQuantitySold;
            this.totalRevenue = totalRevenue;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public long getTotalQuantitySold() {
            return totalQuantitySold;
        }

        public void setTotalQuantitySold(long totalQuantitySold) {
            this.totalQuantitySold = totalQuantitySold;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }

    public static class LowStockProductDto {
        private Long id;
        private String name;
        private String imageUrl;
        private BigDecimal price;
        private Integer stockQuantity;

        public LowStockProductDto() {}

        public LowStockProductDto(Long id, String name, String imageUrl, BigDecimal price, Integer stockQuantity) {
            this.id = id;
            this.name = name;
            this.imageUrl = imageUrl;
            this.price = price;
            this.stockQuantity = stockQuantity;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public Integer getStockQuantity() {
            return stockQuantity;
        }

        public void setStockQuantity(Integer stockQuantity) {
            this.stockQuantity = stockQuantity;
        }
    }

    public static class DashboardStatsResponse {
        private BigDecimal totalRevenue = BigDecimal.ZERO;
        private BigDecimal todayRevenue = BigDecimal.ZERO;
        private BigDecimal thisMonthRevenue = BigDecimal.ZERO;
        private long totalOrders = 0;
        private long todayOrders = 0;
        private long thisMonthOrders = 0;
        private long pendingOrders = 0;
        private long confirmedOrders = 0;
        private long shippingOrders = 0;
        private long completedOrders = 0;
        private long cancelledOrders = 0;
        private long totalCustomers = 0;
        private long totalProducts = 0;
        private long lowStockProducts = 0;
        private long codOrdersCount = 0;
        private long vnpayOrdersCount = 0;
        private BigDecimal codRevenue = BigDecimal.ZERO;
        private BigDecimal vnpayRevenue = BigDecimal.ZERO;
        private List<DailyRevenueDto> dailyRevenues = List.of();
        private List<TopSellingProductDto> topSellingProducts = List.of();
        private List<LowStockProductDto> lowStockProductList = List.of();
        private List<OrderResponse> recentOrders = List.of();

        public DashboardStatsResponse() {}

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public BigDecimal getTodayRevenue() {
            return todayRevenue;
        }

        public void setTodayRevenue(BigDecimal todayRevenue) {
            this.todayRevenue = todayRevenue;
        }

        public BigDecimal getThisMonthRevenue() {
            return thisMonthRevenue;
        }

        public void setThisMonthRevenue(BigDecimal thisMonthRevenue) {
            this.thisMonthRevenue = thisMonthRevenue;
        }

        public long getTotalOrders() {
            return totalOrders;
        }

        public void setTotalOrders(long totalOrders) {
            this.totalOrders = totalOrders;
        }

        public long getTodayOrders() {
            return todayOrders;
        }

        public void setTodayOrders(long todayOrders) {
            this.todayOrders = todayOrders;
        }

        public long getThisMonthOrders() {
            return thisMonthOrders;
        }

        public void setThisMonthOrders(long thisMonthOrders) {
            this.thisMonthOrders = thisMonthOrders;
        }

        public long getPendingOrders() {
            return pendingOrders;
        }

        public void setPendingOrders(long pendingOrders) {
            this.pendingOrders = pendingOrders;
        }

        public long getConfirmedOrders() {
            return confirmedOrders;
        }

        public void setConfirmedOrders(long confirmedOrders) {
            this.confirmedOrders = confirmedOrders;
        }

        public long getShippingOrders() {
            return shippingOrders;
        }

        public void setShippingOrders(long shippingOrders) {
            this.shippingOrders = shippingOrders;
        }

        public long getCompletedOrders() {
            return completedOrders;
        }

        public void setCompletedOrders(long completedOrders) {
            this.completedOrders = completedOrders;
        }

        public long getCancelledOrders() {
            return cancelledOrders;
        }

        public void setCancelledOrders(long cancelledOrders) {
            this.cancelledOrders = cancelledOrders;
        }

        public long getTotalCustomers() {
            return totalCustomers;
        }

        public void setTotalCustomers(long totalCustomers) {
            this.totalCustomers = totalCustomers;
        }

        public long getTotalProducts() {
            return totalProducts;
        }

        public void setTotalProducts(long totalProducts) {
            this.totalProducts = totalProducts;
        }

        public long getLowStockProducts() {
            return lowStockProducts;
        }

        public void setLowStockProducts(long lowStockProducts) {
            this.lowStockProducts = lowStockProducts;
        }

        public long getCodOrdersCount() {
            return codOrdersCount;
        }

        public void setCodOrdersCount(long codOrdersCount) {
            this.codOrdersCount = codOrdersCount;
        }

        public long getVnpayOrdersCount() {
            return vnpayOrdersCount;
        }

        public void setVnpayOrdersCount(long vnpayOrdersCount) {
            this.vnpayOrdersCount = vnpayOrdersCount;
        }

        public BigDecimal getCodRevenue() {
            return codRevenue;
        }

        public void setCodRevenue(BigDecimal codRevenue) {
            this.codRevenue = codRevenue;
        }

        public BigDecimal getVnpayRevenue() {
            return vnpayRevenue;
        }

        public void setVnpayRevenue(BigDecimal vnpayRevenue) {
            this.vnpayRevenue = vnpayRevenue;
        }

        public List<DailyRevenueDto> getDailyRevenues() {
            return dailyRevenues;
        }

        public void setDailyRevenues(List<DailyRevenueDto> dailyRevenues) {
            this.dailyRevenues = dailyRevenues;
        }

        public List<TopSellingProductDto> getTopSellingProducts() {
            return topSellingProducts;
        }

        public void setTopSellingProducts(List<TopSellingProductDto> topSellingProducts) {
            this.topSellingProducts = topSellingProducts;
        }

        public List<LowStockProductDto> getLowStockProductList() {
            return lowStockProductList;
        }

        public void setLowStockProductList(List<LowStockProductDto> lowStockProductList) {
            this.lowStockProductList = lowStockProductList;
        }

        public List<OrderResponse> getRecentOrders() {
            return recentOrders;
        }

        public void setRecentOrders(List<OrderResponse> recentOrders) {
            this.recentOrders = recentOrders;
        }
    }
}
