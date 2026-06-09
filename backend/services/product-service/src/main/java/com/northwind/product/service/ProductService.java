package com.northwind.product.service;

import com.northwind.product.dto.ProductDtos.ProductRequest;
import com.northwind.product.dto.ProductDtos.ProductResponse;
import com.northwind.product.entity.ProductEntity;
import com.northwind.product.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {
  private final ProductRepository repository;

  public List<ProductResponse> findAll() {
    return repository.findAll().stream().map(this::toResponse).toList();
  }

  public ProductResponse create(ProductRequest request) {
    ProductEntity entity = new ProductEntity();
    entity.setSku(request.sku());
    entity.setName(request.name());
    entity.setDescription(request.description());
    entity.setUnitPrice(request.unitPrice());
    entity.setStatus("ACTIVE");
    return toResponse(repository.save(entity));
  }

  private ProductResponse toResponse(ProductEntity entity) {
    return new ProductResponse(entity.getId(), entity.getSku(), entity.getName(), entity.getDescription(), entity.getUnitPrice(), entity.getStatus());
  }
}

