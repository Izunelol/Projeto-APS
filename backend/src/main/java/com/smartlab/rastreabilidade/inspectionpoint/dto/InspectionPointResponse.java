package com.smartlab.rastreabilidade.inspectionpoint.dto;

import com.smartlab.rastreabilidade.inspectionpoint.Criticality;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPoint;
import com.smartlab.rastreabilidade.inspectionpoint.PointStatus;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InspectionPointResponse {

    private final UUID id;
    private final String code;
    private final UUID clientId;
    private final String clientName;
    private final String clientAcronym;
    private final UUID unitId;
    private final String unitName;
    private final UUID areaId;
    private final String areaName;
    private final String areaAcronym;
    private final UUID pointTypeId;
    private final String pointTypeName;
    private final String pointTypeAcronym;
    private final Integer sequenceNumber;
    private final String locationDescription;
    private final String description;
    private final Criticality criticality;
    private final PointStatus status;
    private final String referencePhotoUrl;
    private final String qrCodeUrl;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static InspectionPointResponse from(InspectionPoint point) {
        return InspectionPointResponse.builder()
                .id(point.getId())
                .code(point.getCode())
                .clientId(point.getClient().getId())
                .clientName(point.getClient().getName())
                .clientAcronym(point.getClient().getAcronym())
                .unitId(point.getUnit().getId())
                .unitName(point.getUnit().getName())
                .areaId(point.getArea().getId())
                .areaName(point.getArea().getName())
                .areaAcronym(point.getArea().getAcronym())
                .pointTypeId(point.getPointType().getId())
                .pointTypeName(point.getPointType().getName())
                .pointTypeAcronym(point.getPointType().getAcronym())
                .sequenceNumber(point.getSequenceNumber())
                .locationDescription(point.getLocationDescription())
                .description(point.getDescription())
                .criticality(point.getCriticality())
                .status(point.getStatus())
                .referencePhotoUrl(point.getReferencePhotoUrl())
                .qrCodeUrl(point.getQrCodeUrl())
                .createdAt(point.getCreatedAt())
                .updatedAt(point.getUpdatedAt())
                .build();
    }
}
