package com.smartlab.rastreabilidade.inspection;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InspectionRepository extends JpaRepository<Inspection, UUID> {

    /**
     * inspectionPoint/inspector carregados via @EntityGraph pelo mesmo motivo
     * documentado em InspectionPointRepository: open-in-view=false fecha a
     * sessão Hibernate antes do Controller mapear para InspectionResponse.
     */
    @EntityGraph(attributePaths = {"inspectionPoint", "inspector"})
    List<Inspection> findByInspectionPointIdOrderByInspectionDateDesc(UUID inspectionPointId);

    List<Inspection> findByInspectionPointIdOrderByInspectionDateAsc(UUID inspectionPointId);

    @Override
    @EntityGraph(attributePaths = {"inspectionPoint", "inspector"})
    Optional<Inspection> findById(UUID id);

    long countByConforming(boolean conforming);

    long countByInspectionDate(LocalDate inspectionDate);

    /**
     * Usadas pelos indicadores de "by-area"/"by-type": total de inspeções e
     * quantas delas são conformes, agrupadas pela área/tipo do ponto inspecionado.
     */
    @Query("SELECT ip.area.id, COUNT(i), SUM(CASE WHEN i.conforming = true THEN 1L ELSE 0L END) "
            + "FROM Inspection i JOIN i.inspectionPoint ip GROUP BY ip.area.id")
    List<Object[]> countInspectionsGroupedByArea();

    @Query("SELECT ip.pointType.id, COUNT(i), SUM(CASE WHEN i.conforming = true THEN 1L ELSE 0L END) "
            + "FROM Inspection i JOIN i.inspectionPoint ip GROUP BY ip.pointType.id")
    List<Object[]> countInspectionsGroupedByPointType();
}
