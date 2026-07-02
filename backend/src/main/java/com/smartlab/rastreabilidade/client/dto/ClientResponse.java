package com.smartlab.rastreabilidade.client.dto;

import com.smartlab.rastreabilidade.client.Client;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClientResponse {

    private final UUID id;
    private final String name;
    private final String acronym;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public static ClientResponse from(Client client) {
        return ClientResponse.builder()
                .id(client.getId())
                .name(client.getName())
                .acronym(client.getAcronym())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }
}
