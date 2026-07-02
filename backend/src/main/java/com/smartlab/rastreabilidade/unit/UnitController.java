package com.smartlab.rastreabilidade.unit;

import com.smartlab.rastreabilidade.unit.dto.UnitRequest;
import com.smartlab.rastreabilidade.unit.dto.UnitResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @GetMapping("/api/clients/{clientId}/units")
    public List<UnitResponse> listByClient(@PathVariable UUID clientId) {
        return unitService.listByClient(clientId).stream().map(UnitResponse::from).toList();
    }

    @PostMapping("/api/clients/{clientId}/units")
    public ResponseEntity<UnitResponse> create(@PathVariable UUID clientId, @Valid @RequestBody UnitRequest request) {
        Unit unit = unitService.create(clientId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UnitResponse.from(unit));
    }

    @GetMapping("/api/units/{id}")
    public UnitResponse getById(@PathVariable UUID id) {
        return UnitResponse.from(unitService.getById(id));
    }

    @PutMapping("/api/units/{id}")
    public UnitResponse update(@PathVariable UUID id, @Valid @RequestBody UnitRequest request) {
        return UnitResponse.from(unitService.update(id, request));
    }

    @DeleteMapping("/api/units/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        unitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
