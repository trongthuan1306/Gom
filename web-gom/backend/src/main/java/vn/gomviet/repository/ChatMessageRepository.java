package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.ChatMessage;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
}
