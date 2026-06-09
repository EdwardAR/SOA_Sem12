package com.northwind.product.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class ProductEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String sku;
  private String name;
  private String description;
  private BigDecimal unitPrice;
  private String status;
}

