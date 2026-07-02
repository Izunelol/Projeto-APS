package com.smartlab.rastreabilidade.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryResponse {

    private final long totalPoints;
    private final long totalInspections;
    private final long conformingCount;
    private final long nonConformingCount;
    private final double conformingPercentage;
    private final double nonConformingPercentage;
    private final long inspectionsToday;
}
