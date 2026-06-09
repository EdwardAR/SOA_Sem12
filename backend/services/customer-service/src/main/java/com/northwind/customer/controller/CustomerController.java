package com.northwind.customer.controller;

import com.northwind.customer.dto.CustomerDtos.CustomerRequest;
import com.northwind.customer.dto.CustomerDtos.CustomerResponse;
import com.northwind.customer.service.CustomerService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
  private final CustomerService customerService;

  @GetMapping
  public List<CustomerResponse> list() {
    return customerService.findAll();
  }

  @PostMapping
  public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(request));
  }
}

