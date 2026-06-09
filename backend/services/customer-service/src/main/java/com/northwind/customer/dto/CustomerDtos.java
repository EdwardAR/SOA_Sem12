package com.northwind.customer.dto;

public final class CustomerDtos {
  private CustomerDtos() {}

  public record CustomerRequest(String code, String name, String email, String phone, String address) {}
  public record CustomerResponse(Long id, String code, String name, String email, String phone, String address, String status) {}
}

