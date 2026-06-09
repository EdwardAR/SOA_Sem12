package com.northwind.product.dto;

import java.math.BigDecimal;

public final class ProductDtos {
  private ProductDtos() {}

  public record ProductRequest(String sku, String name, String description, BigDecimal unitPrice) {}
  public record ProductResponse(Long id, String sku, String name, String description, BigDecimal unitPrice, String status) {}
}

