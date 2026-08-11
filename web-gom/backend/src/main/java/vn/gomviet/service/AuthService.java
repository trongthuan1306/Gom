package vn.gomviet.service;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.gomviet.dto.AuthDtos.*;
import vn.gomviet.entity.*;
import vn.gomviet.exception.ApiException;
import vn.gomviet.repository.*;
import vn.gomviet.security.JwtService;

@Service
public class AuthService {
    private final UserRepository users;
    private final RefreshTokenRepository tokens;
    private final OtpCodeRepository otpCodes;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authentication;
    private final JwtService jwt;
    private final EmailService emailService;
    private final long refreshExpiration;
    private final SecureRandom random = new SecureRandom();

    private static final long OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

    public AuthService(UserRepository users, RefreshTokenRepository tokens, OtpCodeRepository otpCodes,
                       PasswordEncoder encoder, AuthenticationManager authentication, JwtService jwt,
                       EmailService emailService, @Value("${app.jwt.refresh-expiration-ms}") long refreshExpiration) {
        this.users = users;
        this.tokens = tokens;
        this.otpCodes = otpCodes;
        this.encoder = encoder;
        this.authentication = authentication;
        this.jwt = jwt;
        this.emailService = emailService;
        this.refreshExpiration = refreshExpiration;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email()))
            throw new ApiException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        var user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(encoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(false);
        users.save(user);
        String otp = generateAndSaveOtp(user.getEmail(), OtpType.VERIFY_EMAIL);
        emailService.sendVerificationEmail(user.getEmail(), otp);
        return new MessageResponse("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.");
    }

    @Transactional
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        verifyOtp(request.email(), request.otp(), OtpType.VERIFY_EMAIL);
        var user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        user.setEnabled(true);
        users.save(user);
        return issue(user);
    }

    @Transactional
    public MessageResponse resendVerification(ResendVerificationRequest request) {
        var user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Email chưa được đăng ký"));
        if (user.isEnabled())
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email đã được xác thực");
        String otp = generateAndSaveOtp(user.getEmail(), OtpType.VERIFY_EMAIL);
        emailService.sendVerificationEmail(user.getEmail(), otp);
        return new MessageResponse("Đã gửi lại mã xác thực.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác"));
        
        try {
            authentication.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
        }

        if (!user.isEnabled()) {
            String otp = generateAndSaveOtp(user.getEmail(), OtpType.VERIFY_EMAIL);
            emailService.sendVerificationEmail(user.getEmail(), otp);
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa xác thực email. Mã OTP mới đã được gửi đến email của bạn.");
        }

        return issue(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        var stored = tokens.findByTokenHashAndRevokedFalse(hash(request.refreshToken()))
                .filter(token -> token.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));
        stored.setRevoked(true);
        return issue(stored.getUser());
    }

    @Transactional(readOnly = true)
    public UserProfile me(String email) {
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
        return new UserProfile(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole().name());
    }

    @Transactional
    public UserProfile updateProfile(String email, UpdateProfileRequest request) {
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setAddress(request.address() != null ? request.address().trim() : null);
        users.save(user);
        return new UserProfile(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getAddress(), user.getRole().name());
    }

    @Transactional
    public MessageResponse changePassword(String email, ChangePasswordRequest request) {
        var user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        if (!encoder.matches(request.currentPassword(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
        return new MessageResponse("Đổi mật khẩu thành công.");
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        var user = users.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user != null) {
            String otp = generateAndSaveOtp(user.getEmail(), OtpType.RESET_PASSWORD);
            emailService.sendPasswordResetEmail(user.getEmail(), otp);
        }
        return new MessageResponse("Nếu email tồn tại, mã đặt lại mật khẩu đã được gửi.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        verifyOtp(request.email(), request.otp(), OtpType.RESET_PASSWORD);
        var user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);
        return new MessageResponse("Mật khẩu đã được đặt lại thành công.");
    }

    private String generateAndSaveOtp(String email, OtpType type) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        var otp = new OtpCode();
        otp.setEmail(email.toLowerCase());
        otp.setCode(code);
        otp.setType(type);
        otp.setExpiresAt(Instant.now().plusMillis(OTP_EXPIRATION_MS));
        otpCodes.save(otp);
        return code;
    }

    private void verifyOtp(String email, String code, OtpType type) {
        var otp = otpCodes.findFirstByEmailIgnoreCaseAndTypeAndUsedFalseOrderByCreatedAtDesc(email, type)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP không tồn tại"));
        if (otp.getExpiresAt().isBefore(Instant.now()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn");
        if (!otp.getCode().equals(code))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng");
        otp.setUsed(true);
        otpCodes.save(otp);
    }

    private AuthResponse issue(User user) {
        byte[] raw = new byte[48];
        random.nextBytes(raw);
        String refresh = HexFormat.of().formatHex(raw);
        var token = new RefreshToken();
        token.setTokenHash(hash(refresh));
        token.setUser(user);
        token.setExpiresAt(Instant.now().plusMillis(refreshExpiration));
        tokens.save(token);
        return new AuthResponse(jwt.createAccessToken(user), refresh, jwt.accessExpirationSeconds(), "Bearer");
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
