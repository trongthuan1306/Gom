package vn.gomviet.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.gomviet.entity.Province;

import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, String> {
    List<Province> findAllByOrderByFullNameAsc();
    List<Province> findByFullNameContainingIgnoreCaseOrderByFullNameAsc(String keyword);
}
