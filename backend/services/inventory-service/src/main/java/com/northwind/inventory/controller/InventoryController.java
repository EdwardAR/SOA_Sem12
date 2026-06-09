package com.northwind.inventory.controller;

import com.northwind.inventory.dto.InventoryDtos.InventoryCheckRequest;
import com.northwind.inventory.dto.InventoryDtos.InventoryResponse;
import com.northwind.inventory.dto.InventoryDtos.RestockRequest;
import com.northwind.inventory.service.InventoryService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
  private final InventoryService inventoryService;

  @PostMapping("/check")
  public Map<String, Object> check(@RequestBody InventoryCheckRequest request) {
    return inventoryService.check(request);
  }

  @PostMapping("/reserve")
  public Map<String, Object> reserve(@RequestBody InventoryCheckRequest request) {
    return inventoryService.reserve(request);
  }

  @PostMapping("/restock")
  public Map<String, Object> restock(@RequestBody RestockRequest request) {
    return inventoryService.restock(request);
  }

  @GetMapping("/{productId}")
  public InventoryResponse get(@PathVariable Long productId) {
    return inventoryService.get(productId);
  }
}
