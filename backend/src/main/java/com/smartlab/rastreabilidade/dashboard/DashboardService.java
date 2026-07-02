package com.smartlab.rastreabilidade.dashboard;

import com.smartlab.rastreabilidade.dashboard.dto.DashboardSummaryResponse;
import com.smartlab.rastreabilidade.inspection.InspectionRepository;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InspectionPointRepository inspectionPointRepository;
    private final InspectionRepository inspectionRepository;

    public DashboardSummaryResponse getSummary() {
        long totalPoints = inspectionPointRepository.count();
        long totalInspections = inspectionRepository.count();
        long conformingCount = inspectionRepository.countByConforming(true);
        long nonConformingCount = inspectionRepository.countByConforming(false);
        long inspectionsToday = inspectionRepository.countByInspectionDate(LocalDate.now());

        double conformingPercentage = percentage(conformingCount, totalInspections);
        double nonConformingPercentage = percentage(nonConformingCount, totalInspections);

        return DashboardSummaryResponse.builder()
                .totalPoints(totalPoints)
                .totalInspections(totalInspections)
                .conformingCount(conformingCount)
                .nonConformingCount(nonConformingCount)
                .conformingPercentage(conformingPercentage)
                .nonConformingPercentage(nonConformingPercentage)
                .inspectionsToday(inspectionsToday)
                .build();
    }

    private double percentage(long count, long total) {
        return total == 0 ? 0.0 : (count * 100.0) / total;
    }
}
