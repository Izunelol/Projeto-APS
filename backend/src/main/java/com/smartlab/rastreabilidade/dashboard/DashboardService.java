package com.smartlab.rastreabilidade.dashboard;

import com.smartlab.rastreabilidade.dashboard.dto.AreaIndicatorResponse;
import com.smartlab.rastreabilidade.dashboard.dto.DashboardSummaryResponse;
import com.smartlab.rastreabilidade.dashboard.dto.MeasurementTrendResponse;
import com.smartlab.rastreabilidade.dashboard.dto.PointTypeIndicatorResponse;
import com.smartlab.rastreabilidade.inspection.InspectionRepository;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointRepository;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointService;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InspectionPointRepository inspectionPointRepository;
    private final InspectionRepository inspectionRepository;
    private final InspectionPointService inspectionPointService;

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

    public List<AreaIndicatorResponse> getByArea() {
        Map<UUID, long[]> inspectionStats = new HashMap<>();
        for (Object[] row : inspectionRepository.countInspectionsGroupedByArea()) {
            inspectionStats.put((UUID) row[0], toStats(row));
        }

        return inspectionPointRepository.countPointsGroupedByArea().stream()
                .map(row -> {
                    UUID areaId = (UUID) row[0];
                    long[] stats = inspectionStats.getOrDefault(areaId, new long[] {0L, 0L});
                    long totalInspections = stats[0];
                    long conformingCount = stats[1];
                    return AreaIndicatorResponse.builder()
                            .areaId(areaId)
                            .areaName((String) row[1])
                            .totalPoints((long) row[2])
                            .totalInspections(totalInspections)
                            .conformingCount(conformingCount)
                            .nonConformingCount(totalInspections - conformingCount)
                            .conformingPercentage(percentage(conformingCount, totalInspections))
                            .build();
                })
                .toList();
    }

    public List<PointTypeIndicatorResponse> getByType() {
        Map<UUID, long[]> inspectionStats = new HashMap<>();
        for (Object[] row : inspectionRepository.countInspectionsGroupedByPointType()) {
            inspectionStats.put((UUID) row[0], toStats(row));
        }

        return inspectionPointRepository.countPointsGroupedByPointType().stream()
                .map(row -> {
                    UUID pointTypeId = (UUID) row[0];
                    long[] stats = inspectionStats.getOrDefault(pointTypeId, new long[] {0L, 0L});
                    long totalInspections = stats[0];
                    long conformingCount = stats[1];
                    return PointTypeIndicatorResponse.builder()
                            .pointTypeId(pointTypeId)
                            .pointTypeName((String) row[1])
                            .totalPoints((long) row[2])
                            .totalInspections(totalInspections)
                            .conformingCount(conformingCount)
                            .nonConformingCount(totalInspections - conformingCount)
                            .conformingPercentage(percentage(conformingCount, totalInspections))
                            .build();
                })
                .toList();
    }

    public List<MeasurementTrendResponse> getMeasurementsTrend(String pointCode) {
        UUID pointId = inspectionPointService.getByCode(pointCode).getId();
        return inspectionRepository.findByInspectionPointIdOrderByInspectionDateAsc(pointId).stream()
                .map(inspection -> MeasurementTrendResponse.builder()
                        .inspectionDate(inspection.getInspectionDate())
                        .electricalContinuityMohm(inspection.getElectricalContinuityMohm())
                        .groundingResistanceOhm(inspection.getGroundingResistanceOhm())
                        .build())
                .toList();
    }

    private long[] toStats(Object[] row) {
        long total = ((Number) row[1]).longValue();
        long conforming = row[2] == null ? 0L : ((Number) row[2]).longValue();
        return new long[] {total, conforming};
    }

    private double percentage(long count, long total) {
        return total == 0 ? 0.0 : (count * 100.0) / total;
    }
}
