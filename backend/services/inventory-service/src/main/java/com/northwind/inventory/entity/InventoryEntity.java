package com.northwind.inventory.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventory")
public class InventoryEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private Long productId;
  private Integer availableQuantity;
  private Integer reservedQuantity;
  private Integer reorderLevel;
  private String status;
}

