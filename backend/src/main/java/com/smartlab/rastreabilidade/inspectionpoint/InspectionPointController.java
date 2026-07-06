package com.smartlab.rastreabilidade.inspectionpoint;

import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointCreateRequest;
import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointResponse;
import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointUpdateRequest;
import com.smartlab.rastreabilidade.common.PageResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inspection-points")
@RequiredArgsConstructor
public class InspectionPointController {

    private final InspectionPointService inspectionPointService;
    private final InspectionPointReportService inspectionPointReportService;

    @GetMapping
    public PageResponse<InspectionPointResponse> list(
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID pointTypeId,
            @RequestParam(required = false) PointStatus status,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return PageResponse.from(inspectionPointService.list(clientId, areaId, pointTypeId, status, pageable)
                .map(InspectionPointResponse::from));
    }

    @PostMapping
    public ResponseEntity<InspectionPointResponse> create(@Valid @RequestBody InspectionPointCreateRequest request) {
        InspectionPoint point = inspectionPointService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(InspectionPointResponse.from(point));
    }

    @GetMapping("/{code}")
    public InspectionPointResponse getByCode(@PathVariable String code) {
        return InspectionPointResponse.from(inspectionPointService.getByCode(code));
    }

    @PutMapping("/{id}")
    public InspectionPointResponse update(@PathVariable UUID id,
                                           @Valid @RequestBody InspectionPointUpdateRequest request) {
        return InspectionPointResponse.from(inspectionPointService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        inspectionPointService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{code}/report")
    public ResponseEntity<byte[]> report(@PathVariable String code) {
        byte[] pdf = inspectionPointReportService.generate(code);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ponto-" + code + ".pdf\"")
                .body(pdf);
    }
}
