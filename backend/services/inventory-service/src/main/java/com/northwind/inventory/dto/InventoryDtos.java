package com.northwind.inventory.dto;

import java.math.BigDecimal;
import java.util.List;

public final class InventoryDtos {
  private InventoryDtos() {}
  public record InventoryItemRequest(Long productId, Integer quantity, BigDecimal unitPrice) {}
  public record InventoryCheckRequest(List<InventoryItemRequest> items) {}
  public record RestockRequest(List<InventoryItemRequest> items) {}
  public record InventoryResponse(Long productId, Integer availableQuantity, Integer reservedQuantity, String status) {}
}
