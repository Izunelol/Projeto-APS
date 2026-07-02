package com.smartlab.rastreabilidade.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientRequest {

    @NotBlank(message = "nome é obrigatório")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "sigla é obrigatória")
    @Size(max = 10)
    private String acronym;
}
