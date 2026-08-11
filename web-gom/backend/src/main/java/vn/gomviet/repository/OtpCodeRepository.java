package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.OtpCode;
import vn.gomviet.entity.OtpType;

import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findFirstByEmailIgnoreCaseAndTypeAndUsedFalseOrderByCreatedAtDesc(String email, OtpType type);
}
