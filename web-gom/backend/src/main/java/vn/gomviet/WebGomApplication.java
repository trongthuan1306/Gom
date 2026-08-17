package vn.gomviet;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.gomviet.entity.Role;
import vn.gomviet.entity.User;
import vn.gomviet.repository.UserRepository;

@SpringBootApplication
public class WebGomApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebGomApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdminAccount(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@gomviet.vn";
            User admin = userRepository.findByEmailIgnoreCase(adminEmail).orElseGet(User::new);
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFullName("Quản Trị Viên Hiên Gốm");
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
        };
    }
}
