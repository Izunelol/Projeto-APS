package com.smartlab.rastreabilidade.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MeasurementTrendResponse {

    private final LocalDate inspectionDate;
    private final BigDecimal electricalContinuityMohm;
    private final BigDecimal groundingResistanceOhm;
}
