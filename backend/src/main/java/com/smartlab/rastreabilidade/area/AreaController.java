package com.smartlab.rastreabilidade.area;

import com.smartlab.rastreabilidade.area.dto.AreaRequest;
import com.smartlab.rastreabilidade.area.dto.AreaResponse;
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
public class AreaController {

    private final AreaService areaService;

    @GetMapping("/api/units/{unitId}/areas")
    public List<AreaResponse> listByUnit(@PathVariable UUID unitId) {
        return areaService.listByUnit(unitId).stream().map(AreaResponse::from).toList();
    }

    @PostMapping("/api/units/{unitId}/areas")
    public ResponseEntity<AreaResponse> create(@PathVariable UUID unitId, @Valid @RequestBody AreaRequest request) {
        Area area = areaService.create(unitId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(AreaResponse.from(area));
    }

    @GetMapping("/api/areas/{id}")
    public AreaResponse getById(@PathVariable UUID id) {
        return AreaResponse.from(areaService.getById(id));
    }

    @PutMapping("/api/areas/{id}")
    public AreaResponse update(@PathVariable UUID id, @Valid @RequestBody AreaRequest request) {
        return AreaResponse.from(areaService.update(id, request));
    }

    @DeleteMapping("/api/areas/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        areaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
