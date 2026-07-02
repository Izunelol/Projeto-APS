package com.smartlab.rastreabilidade.area;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AreaRepository extends JpaRepository<Area, UUID> {

    List<Area> findByUnitId(UUID unitId);

    boolean existsByUnitIdAndAcronymIgnoreCase(UUID unitId, String acronym);
}
