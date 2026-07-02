package com.smartlab.rastreabilidade.inspection.dto;

import com.smartlab.rastreabilidade.inspection.Inspection;
import com.smartlab.rastreabilidade.inspection.VisualCondition;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InspectionResponse {

    private final UUID id;
    private final UUID inspectionPointId;
    private final String inspectionPointCode;
    private final LocalDate inspectionDate;
    private final String responsibleName;
    private final UUID inspectorId;
    private final String inspectorName;
    private final VisualCondition visualCondition;
    private final BigDecimal electricalContinuityMohm;
    private final BigDecimal groundingResistanceOhm;
    private final boolean hasOxidation;
    private final boolean needsCorrection;
    private final boolean conforming;
    private final String observations;
    private final String photoUrl;
    private final LocalDateTime createdAt;

    public static InspectionResponse from(Inspection inspection) {
        return InspectionResponse.builder()
                .id(inspection.getId())
                .inspectionPointId(inspection.getInspectionPoint().getId())
                .inspectionPointCode(inspection.getInspectionPoint().getCode())
                .inspectionDate(inspection.getInspectionDate())
                .responsibleName(inspection.getResponsibleName())
                .inspectorId(inspection.getInspector() != null ? inspection.getInspector().getId() : null)
                .inspectorName(inspection.getInspector() != null ? inspection.getInspector().getName() : null)
                .visualCondition(inspection.getVisualCondition())
                .electricalContinuityMohm(inspection.getElectricalContinuityMohm())
                .groundingResistanceOhm(inspection.getGroundingResistanceOhm())
                .hasOxidation(inspection.isHasOxidation())
                .needsCorrection(inspection.isNeedsCorrection())
                .conforming(inspection.isConforming())
                .observations(inspection.getObservations())
                .photoUrl(inspection.getPhotoUrl())
                .createdAt(inspection.getCreatedAt())
                .build();
    }
}
