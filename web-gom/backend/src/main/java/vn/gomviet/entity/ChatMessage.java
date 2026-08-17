package vn.gomviet.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Column(nullable = false, length = 20)
    private String role; // "user", "assistant", "system"

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "recommendations_json", columnDefinition = "text")
    private String recommendationsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ChatMessage() {}

    public ChatMessage(ChatSession session, String role, String content, String recommendationsJson) {
        this.session = session;
        this.role = role;
        this.content = content;
        this.recommendationsJson = recommendationsJson;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public ChatSession getSession() {
        return session;
    }

    public void setSession(ChatSession session) {
        this.session = session;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRecommendationsJson() {
        return recommendationsJson;
    }

    public void setRecommendationsJson(String recommendationsJson) {
        this.recommendationsJson = recommendationsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
