package com.smartlab.rastreabilidade.inspection.dto;

import com.smartlab.rastreabilidade.inspection.VisualCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InspectionRequest {

    @NotNull(message = "data da inspeção é obrigatória")
    private LocalDate inspectionDate;

    @Size(max = 120)
    private String responsibleName;

    @NotNull(message = "condição visual é obrigatória")
    private VisualCondition visualCondition;

    @DecimalMin(value = "0", message = "continuidade elétrica não pode ser negativa")
    private BigDecimal electricalContinuityMohm;

    @DecimalMin(value = "0", message = "resistência de aterramento não pode ser negativa")
    private BigDecimal groundingResistanceOhm;

    private boolean hasOxidation;

    private boolean needsCorrection;

    private boolean conforming;

    @Size(max = 2000)
    private String observations;

    @Size(max = 500)
    private String photoUrl;
}
