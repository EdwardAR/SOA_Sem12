package com.northwind.order.service;

import com.northwind.order.client.BillingClient;
import com.northwind.order.client.InventoryClient;
import com.northwind.order.client.WarehouseClient;
import com.northwind.order.dto.OrderDtos.CreateOrderRequest;
import com.northwind.order.dto.OrderDtos.OrderItemResponse;
import com.northwind.order.dto.OrderDtos.OrderResponse;
import com.northwind.order.entity.OrderDetailEntity;
import com.northwind.order.entity.OrderEntity;
import com.northwind.order.repository.OrderDetailRepository;
import com.northwind.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
  private final OrderRepository orderRepository;
  private final OrderDetailRepository orderDetailRepository;
  private final InventoryClient inventoryClient;
  private final BillingClient billingClient;
  private final WarehouseClient warehouseClient;

  public List<OrderResponse> findAll() {
    return orderRepository.findAll().stream().map(order -> new OrderResponse(order.getId(), order.getOrderNumber(), order.getCustomerId(), order.getStatus(), order.getTotalAmount(), List.of(), null, null)).toList();
  }

  public OrderResponse create(CreateOrderRequest request) {
    Map<String, Object> stockPayload = new HashMap<>();
    stockPayload.put("items", request.items());
    Map<String, Object> stockResult = inventoryClient.check(stockPayload);
    boolean available = Boolean.TRUE.equals(stockResult.get("available"));

    OrderEntity order = new OrderEntity();
    order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    order.setCustomerId(request.customerId());
    order.setStatus(available ? "READY_FOR_BILLING" : "PENDING");
    order.setTotalAmount(request.items().stream()
      .map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
      .reduce(BigDecimal.ZERO, BigDecimal::add));
    order = orderRepository.save(order);
    final OrderEntity finalOrder = order;

    List<OrderItemResponse> items = request.items().stream().map(i -> {
      BigDecimal lineTotal = i.unitPrice().multiply(BigDecimal.valueOf(i.quantity()));
      OrderDetailEntity detail = new OrderDetailEntity();
      detail.setOrderId(finalOrder.getId());
      detail.setProductId(i.productId());
      detail.setQuantity(i.quantity());
      detail.setUnitPrice(i.unitPrice());
      detail.setLineTotal(lineTotal);
      orderDetailRepository.save(detail);
      return new OrderItemResponse(i.productId(), i.quantity(), i.unitPrice(), lineTotal);
    }).toList();

    if (available) {
      Map<String, Object> reservePayload = new HashMap<>();
      reservePayload.put("orderId", order.getId());
      reservePayload.put("items", request.items());
      inventoryClient.reserve(reservePayload);

      Map<String, Object> invoicePayload = new HashMap<>();
      invoicePayload.put("orderId", order.getId());
      invoicePayload.put("amount", order.getTotalAmount());
      Map<String, Object> invoice = billingClient.createInvoice(invoicePayload);

      Map<String, Object> shipmentPayload = new HashMap<>();
      shipmentPayload.put("orderId", order.getId());
      shipmentPayload.put("orderNumber", order.getOrderNumber());
      Map<String, Object> shipment = warehouseClient.createShipment(shipmentPayload);
      order.setStatus("SHIPPED");
      orderRepository.save(order);
      return new OrderResponse(order.getId(), order.getOrderNumber(), order.getCustomerId(), order.getStatus(), order.getTotalAmount(), items,
        String.valueOf(invoice.get("invoiceNumber")), String.valueOf(shipment.get("trackingCode")));
    }

    Map<String, Object> restockPayload = new HashMap<>();
    restockPayload.put("orderId", order.getId());
    restockPayload.put("items", request.items());
    inventoryClient.restock(restockPayload);
    order.setStatus("PENDING_RESTOCK");
    orderRepository.save(order);
    return new OrderResponse(order.getId(), order.getOrderNumber(), order.getCustomerId(), order.getStatus(), order.getTotalAmount(), items, null, null);
  }
}
