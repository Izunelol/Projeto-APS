package com.smartlab.rastreabilidade.inspection;

import com.smartlab.rastreabilidade.inspectionpoint.InspectionPoint;
import com.smartlab.rastreabilidade.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inspection_point_id", nullable = false)
    private InspectionPoint inspectionPoint;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(name = "responsible_name", length = 120)
    private String responsibleName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private User inspector;

    @Enumerated(EnumType.STRING)
    @Column(name = "visual_condition", nullable = false, length = 20)
    private VisualCondition visualCondition;

    @Column(name = "electrical_continuity_mohm", precision = 10, scale = 2)
    private BigDecimal electricalContinuityMohm;

    @Column(name = "grounding_resistance_ohm", precision = 10, scale = 2)
    private BigDecimal groundingResistanceOhm;

    @Column(name = "has_oxidation", nullable = false)
    private boolean hasOxidation;

    @Column(name = "needs_correction", nullable = false)
    private boolean needsCorrection;

    @Column(name = "is_conforming", nullable = false)
    private boolean conforming;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
