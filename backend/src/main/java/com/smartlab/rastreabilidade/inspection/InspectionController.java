package com.smartlab.rastreabilidade.inspection;

import com.smartlab.rastreabilidade.inspection.dto.InspectionRequest;
import com.smartlab.rastreabilidade.inspection.dto.InspectionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping("/api/inspection-points/{code}/inspections")
    public List<InspectionResponse> listByPointCode(@PathVariable String code) {
        return inspectionService.listByPointCode(code).stream().map(InspectionResponse::from).toList();
    }

    @PostMapping("/api/inspection-points/{code}/inspections")
    public ResponseEntity<InspectionResponse> create(@PathVariable String code,
                                                       @Valid @RequestBody InspectionRequest request) {
        Inspection inspection = inspectionService.create(code, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(InspectionResponse.from(inspection));
    }

    @GetMapping("/api/inspections/{id}")
    public InspectionResponse getById(@PathVariable UUID id) {
        return InspectionResponse.from(inspectionService.getById(id));
    }
}
