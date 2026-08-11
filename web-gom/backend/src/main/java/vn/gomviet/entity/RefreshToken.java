package vn.gomviet.entity;
import jakarta.persistence.*;import java.time.Instant;
@Entity @Table(name="refresh_tokens") public class RefreshToken{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="token_hash",nullable=false,unique=true,length=64) private String tokenHash; @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user; @Column(name="expires_at",nullable=false) private Instant expiresAt; @Column(nullable=false) private boolean revoked;
 public String getTokenHash(){return tokenHash;} public void setTokenHash(String v){tokenHash=v;} public User getUser(){return user;} public void setUser(User v){user=v;} public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant v){expiresAt=v;} public boolean isRevoked(){return revoked;} public void setRevoked(boolean v){revoked=v;}
}
