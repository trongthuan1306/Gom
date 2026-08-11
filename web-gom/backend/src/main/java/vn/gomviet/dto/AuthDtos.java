package vn.gomviet.dto;

import jakarta.validation.constraints.*;

public final class AuthDtos {
  private AuthDtos() {}

  public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email, @Size(min=8,max=72) String password) {}
  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
  public record RefreshRequest(@NotBlank String refreshToken) {}
  public record AuthResponse(String accessToken, String refreshToken, long expiresIn, String tokenType) {}
  public record UserProfile(Long id, String fullName, String email, String phone, String address, String role) {}

  public record UpdateProfileRequest(@NotBlank String fullName, String phone, String address) {}
  public record ChangePasswordRequest(@NotBlank String currentPassword, @Size(min=8,max=72) String newPassword) {}

  public record ForgotPasswordRequest(@Email @NotBlank String email) {}
  public record ResetPasswordRequest(@Email @NotBlank String email, @NotBlank String otp, @Size(min=8,max=72) String newPassword) {}
  public record VerifyEmailRequest(@Email @NotBlank String email, @NotBlank String otp) {}
  public record ResendVerificationRequest(@Email @NotBlank String email) {}
  public record MessageResponse(String message) {}
}
