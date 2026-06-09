package com.northwind.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "orders")
public class OrderEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String orderNumber;
  private Long customerId;
  private String status;
  private BigDecimal totalAmount;
}

