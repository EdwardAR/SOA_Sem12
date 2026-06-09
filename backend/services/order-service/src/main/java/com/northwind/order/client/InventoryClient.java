package com.northwind.order.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "${clients.inventory-url:http://localhost:8085}")
public interface InventoryClient {
  @PostMapping("/api/inventory/check")
  Map<String, Object> check(@RequestBody Map<String, Object> payload);
  @PostMapping("/api/inventory/reserve")
  Map<String, Object> reserve(@RequestBody Map<String, Object> payload);
  @PostMapping("/api/inventory/restock")
  Map<String, Object> restock(@RequestBody Map<String, Object> payload);
}
