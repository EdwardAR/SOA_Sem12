package com.northwind.customer.service;

import com.northwind.customer.dto.CustomerDtos.CustomerRequest;
import com.northwind.customer.dto.CustomerDtos.CustomerResponse;
import com.northwind.customer.entity.CustomerEntity;
import com.northwind.customer.repository.CustomerRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerService {
  private final CustomerRepository repository;

  public List<CustomerResponse> findAll() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  public CustomerResponse create(CustomerRequest request) {
    CustomerEntity entity = new CustomerEntity();
    entity.setCode(request.code());
    entity.setName(request.name());
    entity.setEmail(request.email());
    entity.setPhone(request.phone());
    entity.setAddress(request.address());
    entity.setStatus("ACTIVE");
    return toResponse(repository.save(entity));
  }

  private CustomerResponse toResponse(CustomerEntity entity) {
    return new CustomerResponse(entity.getId(), entity.getCode(), entity.getName(), entity.getEmail(), entity.getPhone(), entity.getAddress(), entity.getStatus());
  }
}

