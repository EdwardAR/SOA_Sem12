package com.northwind.order.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "order_details")
public class OrderDetailEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private Long orderId;
  private Long productId;
  private Integer quantity;
  private BigDecimal unitPrice;
  private BigDecimal lineTotal;
}

