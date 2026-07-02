package com.smartlab.rastreabilidade.pointtype;

import com.smartlab.rastreabilidade.common.PageResponse;
import com.smartlab.rastreabilidade.pointtype.dto.PointTypeRequest;
import com.smartlab.rastreabilidade.pointtype.dto.PointTypeResponse;
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
@RequestMapping("/api/point-types")
@RequiredArgsConstructor
public class PointTypeController {

    private final PointTypeService pointTypeService;

    @GetMapping
    public PageResponse<PointTypeResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.from(pointTypeService.list(pageable).map(PointTypeResponse::from));
    }

    @GetMapping("/{id}")
    public PointTypeResponse getById(@PathVariable UUID id) {
        return PointTypeResponse.from(pointTypeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<PointTypeResponse> create(@Valid @RequestBody PointTypeRequest request) {
        PointType pointType = pointTypeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(PointTypeResponse.from(pointType));
    }

    @PutMapping("/{id}")
    public PointTypeResponse update(@PathVariable UUID id, @Valid @RequestBody PointTypeRequest request) {
        return PointTypeResponse.from(pointTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        pointTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
