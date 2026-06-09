package com.northwind.warehouse.controller;

import com.northwind.warehouse.dto.WarehouseDtos.ShipmentRequest;
import com.northwind.warehouse.dto.WarehouseDtos.ShipmentResponse;
import com.northwind.warehouse.service.WarehouseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class WarehouseController {
  private final WarehouseService warehouseService;

  @PostMapping
  public ShipmentResponse create(@RequestBody ShipmentRequest request) {
    return warehouseService.create(request);
  }

  @GetMapping
  public List<ShipmentResponse> list() {
    return warehouseService.list();
  }
}

