package com.smartlab.rastreabilidade.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "e-mail é obrigatório")
    @Email(message = "e-mail inválido")
    private String email;

    @NotBlank(message = "senha é obrigatória")
    private String password;
}
