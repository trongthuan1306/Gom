package vn.gomviet.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.gomviet.dto.CategoryDtos;
import vn.gomviet.entity.Category;
import vn.gomviet.repository.CategoryRepository;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;

    public CategoryService(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    private CategoryDtos.CategoryResponse mapToResponse(Category c) {
        return new CategoryDtos.CategoryResponse(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getDescription(),
                c.getSeason(),
                c.getFlower(),
                c.getFlowerIcon(),
                c.getMeaning(),
                c.getImageUrl()
        );
    }

    @Transactional(readOnly = true)
    public List<CategoryDtos.CategoryResponse> getAll() {
        return categoryRepo.findAllByOrderByIdAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CategoryDtos.CategoryResponse create(CategoryDtos.CategoryRequest req) {
        String slug = (req.slug() != null && !req.slug().isBlank()) ? req.slug().trim() : toSlug(req.name());
        Category category = new Category(
                req.name().trim(),
                slug,
                req.description() != null ? req.description().trim() : null,
                req.season() != null ? req.season().trim() : "Xuân",
                req.flower() != null ? req.flower().trim() : null,
                req.flowerIcon() != null ? req.flowerIcon().trim() : "🌸",
                req.meaning() != null ? req.meaning().trim() : null,
                req.imageUrl() != null ? req.imageUrl().trim() : null
        );
        Category saved = categoryRepo.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryDtos.CategoryResponse update(Long id, CategoryDtos.CategoryRequest req) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ sưu tập với ID: " + id));

        if (req.name() != null && !req.name().isBlank()) {
            category.setName(req.name().trim());
        }
        if (req.slug() != null && !req.slug().isBlank()) {
            category.setSlug(req.slug().trim());
        }
        category.setDescription(req.description() != null ? req.description().trim() : null);
        category.setSeason(req.season() != null ? req.season().trim() : category.getSeason());
        category.setFlower(req.flower() != null ? req.flower().trim() : category.getFlower());
        category.setFlowerIcon(req.flowerIcon() != null ? req.flowerIcon().trim() : category.getFlowerIcon());
        category.setMeaning(req.meaning() != null ? req.meaning().trim() : category.getMeaning());
        category.setImageUrl(req.imageUrl() != null ? req.imageUrl().trim() : category.getImageUrl());

        Category updated = categoryRepo.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (categoryRepo.existsById(id)) {
            categoryRepo.deleteById(id);
        }
    }
}
