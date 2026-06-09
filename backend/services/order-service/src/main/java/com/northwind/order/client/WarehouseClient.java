package com.northwind.order.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "warehouse-service", url = "${clients.warehouse-url:http://localhost:8087}")
public interface WarehouseClient {
  @PostMapping("/api/shipments")
  Map<String, Object> createShipment(@RequestBody Map<String, Object> payload);
}

