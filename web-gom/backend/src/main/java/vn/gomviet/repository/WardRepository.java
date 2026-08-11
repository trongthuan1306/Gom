package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.Ward;

import java.util.List;

public interface WardRepository extends JpaRepository<Ward, String> {
    List<Ward> findByProvinceCodeOrderByFullNameAsc(String provinceCode);
    List<Ward> findByProvinceCodeAndFullNameContainingIgnoreCaseOrderByFullNameAsc(String provinceCode, String keyword);
}
