package com.smartlab.rastreabilidade.pointtype.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointTypeRequest {

    @NotBlank(message = "nome é obrigatório")
    @Size(max = 120)
    private String name;

    @NotBlank(message = "sigla é obrigatória")
    @Size(max = 10)
    private String acronym;

    private String description;
}
