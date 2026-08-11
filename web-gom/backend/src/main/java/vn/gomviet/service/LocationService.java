package vn.gomviet.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.gomviet.dto.LocationDtos;
import vn.gomviet.entity.Province;
import vn.gomviet.entity.Ward;
import vn.gomviet.repository.ProvinceRepository;
import vn.gomviet.repository.WardRepository;

import java.util.List;

@Service
public class LocationService {

    private final ProvinceRepository provinceRepo;
    private final WardRepository wardRepo;

    public LocationService(ProvinceRepository provinceRepo, WardRepository wardRepo) {
        this.provinceRepo = provinceRepo;
        this.wardRepo = wardRepo;
    }

    @Transactional(readOnly = true)
    public List<LocationDtos.ProvinceResponse> getProvinces(String query) {
        List<Province> list;
        if (query != null && !query.trim().isEmpty()) {
            list = provinceRepo.findByFullNameContainingIgnoreCaseOrderByFullNameAsc(query.trim());
        } else {
            list = provinceRepo.findAllByOrderByFullNameAsc();
        }
        return list.stream()
                .map(p -> new LocationDtos.ProvinceResponse(p.getCode(), p.getName(), p.getFullName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LocationDtos.WardResponse> getWardsByProvince(String provinceCode, String query) {
        List<Ward> list;
        if (query != null && !query.trim().isEmpty()) {
            list = wardRepo.findByProvinceCodeAndFullNameContainingIgnoreCaseOrderByFullNameAsc(provinceCode, query.trim());
        } else {
            list = wardRepo.findByProvinceCodeOrderByFullNameAsc(provinceCode);
        }
        return list.stream()
                .map(w -> new LocationDtos.WardResponse(w.getCode(), w.getName(), w.getFullName(), w.getProvinceCode()))
                .toList();
    }
}
