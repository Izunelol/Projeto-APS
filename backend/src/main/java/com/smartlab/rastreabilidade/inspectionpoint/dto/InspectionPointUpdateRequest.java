package com.smartlab.rastreabilidade.inspectionpoint.dto;

import com.smartlab.rastreabilidade.inspectionpoint.Criticality;
import com.smartlab.rastreabilidade.inspectionpoint.PointStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * areaId/pointTypeId não são editáveis aqui de propósito: o código do ponto
 * já foi gerado a partir deles e mudá-los desalinharia o code existente.
 */
@Getter
@Setter
public class InspectionPointUpdateRequest {

    @Size(max = 255)
    private String locationDescription;

    @Size(max = 2000)
    private String description;

    @NotNull(message = "criticidade é obrigatória")
    private Criticality criticality;

    @NotNull(message = "status é obrigatório")
    private PointStatus status;

    @Size(max = 500)
    private String referencePhotoUrl;
}
