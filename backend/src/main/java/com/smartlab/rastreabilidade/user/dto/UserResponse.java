package com.smartlab.rastreabilidade.user.dto;

import com.smartlab.rastreabilidade.user.Role;
import com.smartlab.rastreabilidade.user.User;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

    private final UUID id;
    private final String name;
    private final String email;
    private final Role role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
