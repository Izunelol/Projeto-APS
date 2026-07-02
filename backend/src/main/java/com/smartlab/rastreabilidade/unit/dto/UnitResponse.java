package com.smartlab.rastreabilidade.unit.dto;

import com.smartlab.rastreabilidade.unit.Unit;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UnitResponse {

    private final UUID id;
    private final UUID clientId;
    private final String name;
    private final String acronym;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static UnitResponse from(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .clientId(unit.getClient().getId())
                .name(unit.getName())
                .acronym(unit.getAcronym())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
