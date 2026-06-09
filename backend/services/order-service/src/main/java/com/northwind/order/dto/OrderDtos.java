package com.northwind.order.dto;

import java.math.BigDecimal;
import java.util.List;

public final class OrderDtos {
  private OrderDtos() {}

  public record OrderItemRequest(Long productId, Integer quantity, BigDecimal unitPrice) {}
  public record CreateOrderRequest(Long customerId, List<OrderItemRequest> items) {}
  public record OrderItemResponse(Long productId, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
  public record OrderResponse(Long id, String orderNumber, Long customerId, String status, BigDecimal totalAmount, List<OrderItemResponse> items, String invoiceNumber, String trackingCode) {}
}

