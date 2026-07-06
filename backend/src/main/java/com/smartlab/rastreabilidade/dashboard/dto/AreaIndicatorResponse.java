package com.smartlab.rastreabilidade.dashboard.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AreaIndicatorResponse {

    private final UUID areaId;
    private final String areaName;
    private final long totalPoints;
    private final long totalInspections;
    private final long conformingCount;
    private final long nonConformingCount;
    private final double conformingPercentage;
}
