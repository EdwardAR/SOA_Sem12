package com.northwind.inventory.service;

import com.northwind.inventory.dto.InventoryDtos.InventoryCheckRequest;
import com.northwind.inventory.dto.InventoryDtos.InventoryItemRequest;
import com.northwind.inventory.dto.InventoryDtos.InventoryResponse;
import com.northwind.inventory.dto.InventoryDtos.RestockRequest;
import com.northwind.inventory.repository.InventoryRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryService {
  private final InventoryRepository repository;

  public Map<String, Object> check(InventoryCheckRequest request) {
    boolean available = request.items().stream().allMatch(this::hasStock);
    Map<String, Object> response = new HashMap<>();
    response.put("available", available);
    return response;
  }

  public Map<String, Object> reserve(InventoryCheckRequest request) {
    request.items().forEach(this::reserveItem);
    Map<String, Object> response = new HashMap<>();
    response.put("reserved", true);
    return response;
  }

  public Map<String, Object> restock(RestockRequest request) {
    Map<String, Object> response = new HashMap<>();
    response.put("restockRequested", true);
    response.put("items", request.items().size());
    return response;
  }

  public InventoryResponse get(Long productId) {
    return repository.findByProductId(productId)
      .map(item -> new InventoryResponse(item.getProductId(), item.getAvailableQuantity(), item.getReservedQuantity(), item.getStatus()))
      .orElse(new InventoryResponse(productId, 0, 0, "NOT_FOUND"));
  }

  private boolean hasStock(InventoryItemRequest request) {
    return repository.findByProductId(request.productId())
      .map(item -> item.getAvailableQuantity() >= request.quantity())
      .orElse(false);
  }

  private void reserveItem(InventoryItemRequest request) {
    repository.findByProductId(request.productId()).ifPresent(item -> {
      item.setAvailableQuantity(item.getAvailableQuantity() - request.quantity());
      item.setReservedQuantity(item.getReservedQuantity() + request.quantity());
      item.setStatus(item.getAvailableQuantity() > 0 ? "AVAILABLE" : "LOW_STOCK");
      repository.save(item);
    });
  }
}
