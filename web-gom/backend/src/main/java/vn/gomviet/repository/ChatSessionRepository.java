package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.gomviet.entity.ChatSession;
import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findBySessionToken(String sessionToken);

    @Query("SELECT s FROM ChatSession s LEFT JOIN FETCH s.messages WHERE s.sessionToken = :sessionToken")
    Optional<ChatSession> findBySessionTokenWithMessages(@Param("sessionToken") String sessionToken);

    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
