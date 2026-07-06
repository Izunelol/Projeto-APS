package com.smartlab.rastreabilidade.dashboard.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PointTypeIndicatorResponse {

    private final UUID pointTypeId;
    private final String pointTypeName;
    private final long totalPoints;
    private final long totalInspections;
    private final long conformingCount;
    private final long nonConformingCount;
    private final double conformingPercentage;
}
