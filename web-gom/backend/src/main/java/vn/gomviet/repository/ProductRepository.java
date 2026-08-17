package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.Product;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByActiveTrue();
    List<Product> findAllByIdInAndActiveTrue(List<Long> ids);
    Optional<Product> findByIdAndActiveTrue(Long id);
    Optional<Product> findBySlugAndActiveTrue(String slug);
    boolean existsBySlug(String slug);
    long countByActiveTrue();
    long countByStockQuantityLessThanEqualAndActiveTrue(int threshold);
    List<Product> findByActiveTrueAndStockQuantityLessThanEqualOrderByStockQuantityAsc(int threshold);
}
