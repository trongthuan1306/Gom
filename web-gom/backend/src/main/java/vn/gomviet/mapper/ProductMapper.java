package vn.gomviet.mapper;

import org.springframework.stereotype.Component;
import vn.gomviet.dto.ProductDto;
import vn.gomviet.entity.Product;

@Component
public class ProductMapper {
    public ProductDto toDto(Product p) {
        return new ProductDto(
            p.getId(),
            p.getSlug(),
            p.getName(),
            p.getDescription(),
            p.getPrice(),
            p.getStockQuantity(),
            p.getImageUrl(),
            p.getMaterials(),
            p.getDimensions(),
            p.getOrigin(),
            p.getCareInstructions(),
            p.getItemType(),
            p.getFlowerType(),
            p.getSeason()
        );
    }
}
