package com.northwind.warehouse.dto;

public final class WarehouseDtos {
  private WarehouseDtos() {}
  public record ShipmentRequest(Long orderId, String orderNumber) {}
  public record ShipmentResponse(Long id, String shipmentNumber, Long orderId, String trackingCode, String status) {}
}

