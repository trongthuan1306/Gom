package vn.gomviet.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mail;

    public EmailService(JavaMailSender mail) { this.mail = mail; }

    public void send(String to, String subject, String body) {
        var m = new SimpleMailMessage();
        m.setTo(to);
        m.setSubject(subject);
        m.setText(body);
        mail.send(m);
    }

    @Async
    public void sendVerificationEmail(String to, String otp) {
        send(to, "Gốm Việt - Xác thực email",
            "Xin chào,\n\n"
            + "Mã xác thực email của bạn là: " + otp + "\n\n"
            + "Mã có hiệu lực trong 10 phút.\n\n"
            + "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n"
            + "Trân trọng,\nGốm Việt");
    }

    @Async
    public void sendPasswordResetEmail(String to, String otp) {
        send(to, "Gốm Việt - Đặt lại mật khẩu",
            "Xin chào,\n\n"
            + "Mã đặt lại mật khẩu của bạn là: " + otp + "\n\n"
            + "Mã có hiệu lực trong 10 phút.\n\n"
            + "Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n"
            + "Trân trọng,\nGốm Việt");
    }
}
