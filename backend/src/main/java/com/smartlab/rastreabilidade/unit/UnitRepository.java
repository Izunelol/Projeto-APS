package com.smartlab.rastreabilidade.unit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitRepository extends JpaRepository<Unit, UUID> {

    List<Unit> findByClientId(UUID clientId);

    boolean existsByClientIdAndAcronymIgnoreCase(UUID clientId, String acronym);
}
