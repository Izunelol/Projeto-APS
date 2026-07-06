package com.smartlab.rastreabilidade.dashboard;

import com.smartlab.rastreabilidade.dashboard.dto.AreaIndicatorResponse;
import com.smartlab.rastreabilidade.dashboard.dto.DashboardSummaryResponse;
import com.smartlab.rastreabilidade.dashboard.dto.MeasurementTrendResponse;
import com.smartlab.rastreabilidade.dashboard.dto.PointTypeIndicatorResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/by-area")
    public List<AreaIndicatorResponse> byArea() {
        return dashboardService.getByArea();
    }

    @GetMapping("/by-type")
    public List<PointTypeIndicatorResponse> byType() {
        return dashboardService.getByType();
    }

    @GetMapping("/measurements-trend")
    public List<MeasurementTrendResponse> measurementsTrend(@RequestParam String pointCode) {
        return dashboardService.getMeasurementsTrend(pointCode);
    }
}
