package com.northwind.billing.service;

import com.northwind.billing.dto.BillingDtos.InvoiceRequest;
import com.northwind.billing.dto.BillingDtos.InvoiceResponse;
import com.northwind.billing.entity.InvoiceEntity;
import com.northwind.billing.repository.InvoiceRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BillingService {
  private final InvoiceRepository repository;

  public InvoiceResponse create(InvoiceRequest request) {
    InvoiceEntity entity = new InvoiceEntity();
    entity.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    entity.setOrderId(request.orderId());
    entity.setAmount(request.amount());
    entity.setStatus("ISSUED");
    entity = repository.save(entity);
    return new InvoiceResponse(entity.getId(), entity.getInvoiceNumber(), entity.getOrderId(), entity.getAmount(), entity.getStatus());
  }

  public List<InvoiceResponse> list() {
    return repository.findAll().stream()
      .map(e -> new InvoiceResponse(e.getId(), e.getInvoiceNumber(), e.getOrderId(), e.getAmount(), e.getStatus()))
      .toList();
  }
}

