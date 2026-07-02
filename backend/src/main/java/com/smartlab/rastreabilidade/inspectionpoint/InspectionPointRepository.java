package com.smartlab.rastreabilidade.inspectionpoint;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InspectionPointRepository extends JpaRepository<InspectionPoint, UUID> {

    Optional<InspectionPoint> findByCode(String code);

    @Query("SELECT COALESCE(MAX(ip.sequenceNumber), 0) FROM InspectionPoint ip "
            + "WHERE ip.client.id = :clientId AND ip.area.id = :areaId AND ip.pointType.id = :pointTypeId")
    Integer findMaxSequenceNumber(@Param("clientId") UUID clientId,
                                   @Param("areaId") UUID areaId,
                                   @Param("pointTypeId") UUID pointTypeId);
}
