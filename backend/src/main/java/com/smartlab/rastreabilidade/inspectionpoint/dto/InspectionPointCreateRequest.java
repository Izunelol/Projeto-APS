package com.smartlab.rastreabilidade.inspectionpoint.dto;

import com.smartlab.rastreabilidade.inspectionpoint.Criticality;
import com.smartlab.rastreabilidade.inspectionpoint.PointStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InspectionPointCreateRequest {

    @NotNull(message = "área é obrigatória")
    private UUID areaId;

    @NotNull(message = "tipo de ponto é obrigatório")
    private UUID pointTypeId;

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
