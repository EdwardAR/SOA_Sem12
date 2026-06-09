package com.northwind.order.controller;

import com.northwind.order.dto.OrderDtos.CreateOrderRequest;
import com.northwind.order.dto.OrderDtos.OrderResponse;
import com.northwind.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
  private final OrderService orderService;

  @PostMapping
  public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(request));
  }

  @GetMapping
  public List<OrderResponse> list() {
    return orderService.findAll();
  }
}

