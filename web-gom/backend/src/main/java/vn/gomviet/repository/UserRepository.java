package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.Role;
import vn.gomviet.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
}
