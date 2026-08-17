package vn.gomviet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "slug", length = 140)
    private String slug;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "season", length = 50)
    private String season;

    @Column(name = "flower", length = 100)
    private String flower;

    @Column(name = "flower_icon", length = 50)
    private String flowerIcon;

    @Column(name = "meaning", length = 255)
    private String meaning;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    public Category() {
    }

    public Category(String name, String slug, String description, String season, String flower, String flowerIcon, String meaning, String imageUrl) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.season = season;
        this.flower = flower;
        this.flowerIcon = flowerIcon;
        this.meaning = meaning;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getFlower() {
        return flower;
    }

    public void setFlower(String flower) {
        this.flower = flower;
    }

    public String getFlowerIcon() {
        return flowerIcon;
    }

    public void setFlowerIcon(String flowerIcon) {
        this.flowerIcon = flowerIcon;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
