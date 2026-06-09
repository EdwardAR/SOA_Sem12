package com.northwind.warehouse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "shipments")
public class ShipmentEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String shipmentNumber;
  private Long orderId;
  private String trackingCode;
  private String status;
  private LocalDateTime shippedAt;
  private LocalDateTime deliveredAt;
}

