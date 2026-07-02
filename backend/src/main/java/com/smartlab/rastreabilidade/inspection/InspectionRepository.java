package com.smartlab.rastreabilidade.inspection;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, UUID> {

    /**
     * inspectionPoint/inspector carregados via @EntityGraph pelo mesmo motivo
     * documentado em InspectionPointRepository: open-in-view=false fecha a
     * sessão Hibernate antes do Controller mapear para InspectionResponse.
     */
    @EntityGraph(attributePaths = {"inspectionPoint", "inspector"})
    List<Inspection> findByInspectionPointIdOrderByInspectionDateDesc(UUID inspectionPointId);

    @Override
    @EntityGraph(attributePaths = {"inspectionPoint", "inspector"})
    Optional<Inspection> findById(UUID id);

    long countByConforming(boolean conforming);

    long countByInspectionDate(LocalDate inspectionDate);
}
