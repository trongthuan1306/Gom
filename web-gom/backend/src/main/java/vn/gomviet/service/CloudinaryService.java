package vn.gomviet.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.gomviet.exception.ApiException;

import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File ảnh không được để trống");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Dung lượng ảnh tối đa là 10MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Định dạng file không hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, AVIF");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "image"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Không thể tải ảnh lên Cloudinary: " + e.getMessage());
        }
    }
}
