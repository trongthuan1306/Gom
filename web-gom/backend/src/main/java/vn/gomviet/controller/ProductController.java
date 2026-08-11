package vn.gomviet.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.gomviet.dto.CartDtos.BatchProductRequest;
import vn.gomviet.dto.ProductDto;
import vn.gomviet.dto.ProductDto.CreateProductRequest;
import vn.gomviet.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService s) {
        service = s;
    }

    @GetMapping
    public List<ProductDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/slug/{slug}")
    public ProductDto getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    @PostMapping("/batch-details")
    public List<ProductDto> batchDetails(@Valid @RequestBody BatchProductRequest request) {
        return service.findByIds(request.ids());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProduct(
            @Valid @RequestPart("product") CreateProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        ProductDto created = service.createProduct(request, imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
