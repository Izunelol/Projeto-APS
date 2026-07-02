package com.smartlab.rastreabilidade.auth.dto;

import com.smartlab.rastreabilidade.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "nome é obrigatório")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "e-mail é obrigatório")
    @Email(message = "e-mail inválido")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "senha é obrigatória")
    @Size(min = 8, max = 100, message = "senha deve ter entre 8 e 100 caracteres")
    private String password;

    private Role role;
}
