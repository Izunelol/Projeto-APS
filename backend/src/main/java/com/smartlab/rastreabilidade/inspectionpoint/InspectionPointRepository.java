package com.smartlab.rastreabilidade.inspectionpoint;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InspectionPointRepository
        extends JpaRepository<InspectionPoint, UUID>, JpaSpecificationExecutor<InspectionPoint> {

    /**
     * client/unit/area/pointType são carregados via @EntityGraph nos métodos de
     * leitura porque a aplicação roda com spring.jpa.open-in-view=false: a sessão
     * Hibernate já fechou quando o Controller mapeia a entidade para o Response
     * (que lê name/acronym dessas associações), então elas não podem ser LAZY
     * proxies nesse ponto.
     */
    @EntityGraph(attributePaths = {"client", "unit", "area", "pointType"})
    Optional<InspectionPoint> findByCode(String code);

    @Override
    @EntityGraph(attributePaths = {"client", "unit", "area", "pointType"})
    Optional<InspectionPoint> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"client", "unit", "area", "pointType"})
    Page<InspectionPoint> findAll(Specification<InspectionPoint> spec, Pageable pageable);

    @Query("SELECT COALESCE(MAX(ip.sequenceNumber), 0) FROM InspectionPoint ip "
            + "WHERE ip.client.id = :clientId AND ip.area.id = :areaId AND ip.pointType.id = :pointTypeId")
    Integer findMaxSequenceNumber(@Param("clientId") UUID clientId,
                                   @Param("areaId") UUID areaId,
                                   @Param("pointTypeId") UUID pointTypeId);

    /**
     * Usados por InspectionPointCodeRegenerationService para recompor o `code`
     * de todos os pontos afetados quando a sigla de um Client/Area/PointType
     * muda (o código embute essas siglas como texto literal, não é derivado
     * dinamicamente em leitura).
     */
    @EntityGraph(attributePaths = {"client", "area", "pointType"})
    List<InspectionPoint> findByClientId(UUID clientId);

    @EntityGraph(attributePaths = {"client", "area", "pointType"})
    List<InspectionPoint> findByAreaId(UUID areaId);

    @EntityGraph(attributePaths = {"client", "area", "pointType"})
    List<InspectionPoint> findByPointTypeId(UUID pointTypeId);

    /**
     * Usadas pelos indicadores de "by-area"/"by-type": contam quantos pontos
     * existem por área/tipo, independente de terem ou não inspeções registradas.
     */
    @Query("SELECT ip.area.id, ip.area.name, COUNT(ip) FROM InspectionPoint ip GROUP BY ip.area.id, ip.area.name")
    List<Object[]> countPointsGroupedByArea();

    @Query("SELECT ip.pointType.id, ip.pointType.name, COUNT(ip) FROM InspectionPoint ip "
            + "GROUP BY ip.pointType.id, ip.pointType.name")
    List<Object[]> countPointsGroupedByPointType();
}
