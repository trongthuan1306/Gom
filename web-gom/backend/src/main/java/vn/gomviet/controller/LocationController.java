package vn.gomviet.controller;

import org.springframework.web.bind.annotation.*;
import vn.gomviet.dto.LocationDtos;
import vn.gomviet.service.LocationService;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/provinces")
    public List<LocationDtos.ProvinceResponse> getProvinces(@RequestParam(required = false) String q) {
        return locationService.getProvinces(q);
    }

    @GetMapping("/provinces/{code}/wards")
    public List<LocationDtos.WardResponse> getWards(@PathVariable String code, @RequestParam(required = false) String q) {
        return locationService.getWardsByProvince(code, q);
    }
}
