package com.smartlab.rastreabilidade.pointtype.dto;

import com.smartlab.rastreabilidade.pointtype.PointType;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PointTypeResponse {

    private final UUID id;
    private final String name;
    private final String acronym;
    private final String description;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static PointTypeResponse from(PointType pointType) {
        return PointTypeResponse.builder()
                .id(pointType.getId())
                .name(pointType.getName())
                .acronym(pointType.getAcronym())
                .description(pointType.getDescription())
                .createdAt(pointType.getCreatedAt())
                .updatedAt(pointType.getUpdatedAt())
                .build();
    }
}
