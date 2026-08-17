package vn.gomviet.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.gomviet.dto.ProductDto;
import vn.gomviet.dto.ProductDto.CreateProductRequest;
import vn.gomviet.entity.Product;
import vn.gomviet.exception.ApiException;
import vn.gomviet.mapper.ProductMapper;
import vn.gomviet.repository.ProductRepository;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class ProductService {
    private final ProductRepository repo;
    private final ProductMapper mapper;
    private final CloudinaryService cloudinaryService;

    public ProductService(ProductRepository r, ProductMapper m, CloudinaryService cloudinaryService) {
        this.repo = r;
        this.mapper = m;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> list() {
        return repo.findAllByActiveTrue().stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductDto> findByIds(List<Long> ids) {
        return repo.findAllByIdInAndActiveTrue(ids).stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product p = repo.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        return mapper.toDto(p);
    }

    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product p = repo.findBySlugAndActiveTrue(slug)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));
        return mapper.toDto(p);
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request, MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadImage(imageFile);
            } catch (Exception e) {
                if (imageUrl == null || imageUrl.isBlank()) {
                    throw e;
                }
            }
        }

        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = toSlug(request.name());
        } else {
            slug = toSlug(slug);
        }

        if (repo.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product p = new Product();
        p.setName(request.name().trim());
        p.setSlug(slug);
        p.setDescription(request.description() != null ? request.description().trim() : null);
        p.setPrice(request.price());
        p.setStockQuantity(request.stockQuantity());
        p.setImageUrl(imageUrl);
        p.setMaterials(request.materials() != null ? request.materials().trim() : null);
        p.setDimensions(request.dimensions() != null ? request.dimensions().trim() : null);
        p.setOrigin(request.origin() != null ? request.origin().trim() : null);
        p.setCareInstructions(request.careInstructions() != null ? request.careInstructions().trim() : null);
        p.setItemType(request.itemType() != null ? request.itemType().trim() : null);
        p.setFlowerType(request.flowerType() != null ? request.flowerType().trim() : null);
        p.setSeason(request.season() != null ? request.season().trim() : null);
        p.setActive(true);

        Product saved = repo.save(p);
        return mapper.toDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto.UpdateProductRequest request, MultipartFile imageFile) {
        Product p = repo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm #" + id));

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(imageFile);
                if (imageUrl != null && !imageUrl.isBlank()) {
                    p.setImageUrl(imageUrl);
                }
            } catch (Exception e) {
                // If failed to upload new image, throw exception
                throw e;
            }
        }

        p.setName(request.name().trim());
        p.setDescription(request.description() != null ? request.description().trim() : null);
        p.setPrice(request.price());
        p.setStockQuantity(request.stockQuantity());
        p.setMaterials(request.materials() != null ? request.materials().trim() : null);
        p.setDimensions(request.dimensions() != null ? request.dimensions().trim() : null);
        p.setOrigin(request.origin() != null ? request.origin().trim() : null);
        p.setCareInstructions(request.careInstructions() != null ? request.careInstructions().trim() : null);
        p.setItemType(request.itemType() != null ? request.itemType().trim() : null);
        p.setFlowerType(request.flowerType() != null ? request.flowerType().trim() : null);
        p.setSeason(request.season() != null ? request.season().trim() : null);

        Product updated = repo.save(p);
        return mapper.toDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product p = repo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm #" + id));
        p.setActive(false);
        repo.save(p);
    }

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("").replace('đ', 'd').replace('Đ', 'd');
        slug = NONLATIN.matcher(slug).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
