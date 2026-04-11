package com.iit.identity.repository;

import com.iit.identity.entity.SessionToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTokenRepository extends JpaRepository<SessionToken, String> {
}
