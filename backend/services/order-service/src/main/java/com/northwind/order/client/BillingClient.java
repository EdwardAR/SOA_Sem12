package com.northwind.order.client;

import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "billing-service", url = "${clients.billing-url:http://localhost:8086}")
public interface BillingClient {
  @PostMapping("/api/invoices")
  Map<String, Object> createInvoice(@RequestBody Map<String, Object> payload);
}

