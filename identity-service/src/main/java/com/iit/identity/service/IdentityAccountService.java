package com.iit.identity.service;

import com.iit.identity.entity.SessionToken;
import com.iit.identity.entity.UserAccount;
import com.iit.identity.model.TokenResponse;
import com.iit.identity.repository.SessionTokenRepository;
import com.iit.identity.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class IdentityAccountService {

    private final UserAccountRepository users;
    private final SessionTokenRepository sessions;
    private final PasswordEncoder passwordEncoder;

    public IdentityAccountService(
            UserAccountRepository users,
            SessionTokenRepository sessions,
            PasswordEncoder passwordEncoder) {
        this.users = users;
        this.sessions = sessions;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UUID signup(String email, String rawPassword) {
        String normalized = email.trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(normalized)) {
            throw new IllegalStateException("EMAIL_EXISTS");
        }
        UUID id = UUID.randomUUID();
        UserAccount user = new UserAccount(id, normalized, passwordEncoder.encode(rawPassword));
        users.save(user);
        return id;
    }

    @Transactional
    public TokenResponse login(String email, String rawPassword) {
        Optional<UserAccount> found = users.findByEmailIgnoreCase(email.trim().toLowerCase());
        if (found.isEmpty() || !passwordEncoder.matches(rawPassword, found.get().getPasswordHash())) {
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        }
        UserAccount user = found.get();
        String token = UUID.randomUUID().toString();
        sessions.save(new SessionToken(token, user));
        return new TokenResponse(token, user.getId().toString());
    }

    @Transactional(readOnly = true)
    public Optional<String> verifyToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return sessions.findById(token.trim()).map(s -> s.getUser().getId().toString());
    }
}
