package com.northwind.warehouse.service;

import com.northwind.warehouse.dto.WarehouseDtos.ShipmentRequest;
import com.northwind.warehouse.dto.WarehouseDtos.ShipmentResponse;
import com.northwind.warehouse.entity.ShipmentEntity;
import com.northwind.warehouse.repository.ShipmentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WarehouseService {
  private final ShipmentRepository repository;

  public ShipmentResponse create(ShipmentRequest request) {
    ShipmentEntity entity = new ShipmentEntity();
    entity.setShipmentNumber("SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    entity.setOrderId(request.orderId());
    entity.setTrackingCode("TRK-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
    entity.setStatus("READY_TO_SHIP");
    entity.setShippedAt(LocalDateTime.now());
    entity = repository.save(entity);
    return new ShipmentResponse(entity.getId(), entity.getShipmentNumber(), entity.getOrderId(), entity.getTrackingCode(), entity.getStatus());
  }

  public List<ShipmentResponse> list() {
    return repository.findAll().stream()
      .map(e -> new ShipmentResponse(e.getId(), e.getShipmentNumber(), e.getOrderId(), e.getTrackingCode(), e.getStatus()))
      .toList();
  }
}

