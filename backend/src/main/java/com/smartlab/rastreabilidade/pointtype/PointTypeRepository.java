package com.smartlab.rastreabilidade.pointtype;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointTypeRepository extends JpaRepository<PointType, UUID> {

    boolean existsByAcronymIgnoreCase(String acronym);
}
