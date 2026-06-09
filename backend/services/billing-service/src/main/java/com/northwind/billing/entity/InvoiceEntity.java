package com.northwind.billing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "invoices")
public class InvoiceEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String invoiceNumber;
  private Long orderId;
  @Column(name = "total_amount")
  private BigDecimal amount;
  private String status;
}

