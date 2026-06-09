package com.northwind.billing.controller;

import com.northwind.billing.dto.BillingDtos.InvoiceRequest;
import com.northwind.billing.dto.BillingDtos.InvoiceResponse;
import com.northwind.billing.service.BillingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class BillingController {
  private final BillingService billingService;

  @PostMapping
  public InvoiceResponse create(@RequestBody InvoiceRequest request) {
    return billingService.create(request);
  }

  @GetMapping
  public List<InvoiceResponse> list() {
    return billingService.list();
  }
}

