package com.smartlab.rastreabilidade.client;

import com.smartlab.rastreabilidade.client.dto.ClientRequest;
import com.smartlab.rastreabilidade.client.dto.ClientResponse;
import com.smartlab.rastreabilidade.common.PageResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public PageResponse<ClientResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.from(clientService.list(pageable).map(ClientResponse::from));
    }

    @GetMapping("/{id}")
    public ClientResponse getById(@PathVariable UUID id) {
        return ClientResponse.from(clientService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientRequest request) {
        Client client = clientService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ClientResponse.from(client));
    }

    @PutMapping("/{id}")
    public ClientResponse update(@PathVariable UUID id, @Valid @RequestBody ClientRequest request) {
        return ClientResponse.from(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
