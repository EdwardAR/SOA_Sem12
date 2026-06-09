package com.northwind.billing.dto;

import java.math.BigDecimal;

public final class BillingDtos {
  private BillingDtos() {}
  public record InvoiceRequest(Long orderId, BigDecimal amount) {}
  public record InvoiceResponse(Long id, String invoiceNumber, Long orderId, BigDecimal amount, String status) {}
}

