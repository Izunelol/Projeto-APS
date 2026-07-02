package com.smartlab.rastreabilidade.area.dto;

import com.smartlab.rastreabilidade.area.Area;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AreaResponse {

    private final UUID id;
    private final UUID unitId;
    private final String name;
    private final String acronym;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static AreaResponse from(Area area) {
        return AreaResponse.builder()
                .id(area.getId())
                .unitId(area.getUnit().getId())
                .name(area.getName())
                .acronym(area.getAcronym())
                .createdAt(area.getCreatedAt())
                .updatedAt(area.getUpdatedAt())
                .build();
    }
}
