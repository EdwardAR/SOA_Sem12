package com.northwind.inventory.repository;

import com.northwind.inventory.entity.InventoryEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<InventoryEntity, Long> {
  Optional<InventoryEntity> findByProductId(Long productId);
}

