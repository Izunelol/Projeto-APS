package com.smartlab.rastreabilidade.auth.dto;

import com.smartlab.rastreabilidade.user.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private final String token;
    @Builder.Default
    private final String tokenType = "Bearer";
    private final long expiresInMinutes;
    private final UserResponse user;
}
