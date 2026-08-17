package vn.gomviet.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import vn.gomviet.security.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-url}") String origin) {
    var config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of(origin, "http://localhost:*", "http://127.0.0.1:*", "http://[::1]:*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }

  @Bean
  SecurityFilterChain chain(HttpSecurity http, JwtAuthenticationFilter jwt, @org.springframework.beans.factory.annotation.Qualifier("corsConfigurationSource") CorsConfigurationSource corsSource) throws Exception {
    return http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(corsSource))
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(requests -> requests
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers(HttpMethod.POST, 
          "/api/auth/register", 
          "/api/auth/login", 
          "/api/auth/refresh",
          "/api/auth/verify-email",
          "/api/auth/resend-verification",
          "/api/auth/forgot-password",
          "/api/auth/reset-password"
        ).permitAll()
        .requestMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/products/batch-details").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/locations/**").permitAll()
        .requestMatchers("/api/payments/vnpay-return").permitAll()
        .requestMatchers("/api/chat/**").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/products").hasAnyRole("STAFF", "ADMIN")
        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("STAFF", "ADMIN")
        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("STAFF", "ADMIN")
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
        .anyRequest().authenticated()
      )
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)
      .build();
  }
}
