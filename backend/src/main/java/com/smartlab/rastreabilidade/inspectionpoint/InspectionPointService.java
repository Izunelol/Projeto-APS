package com.smartlab.rastreabilidade.inspectionpoint;

import com.smartlab.rastreabilidade.area.Area;
import com.smartlab.rastreabilidade.area.AreaService;
import com.smartlab.rastreabilidade.client.Client;
import com.smartlab.rastreabilidade.common.ConflictException;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointCreateRequest;
import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointUpdateRequest;
import com.smartlab.rastreabilidade.pointtype.PointType;
import com.smartlab.rastreabilidade.pointtype.PointTypeService;
import com.smartlab.rastreabilidade.unit.Unit;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InspectionPointService {

    private static final int MAX_CODE_ATTEMPTS = 5;

    private final InspectionPointRepository inspectionPointRepository;
    private final AreaService areaService;
    private final PointTypeService pointTypeService;
    private final InspectionPointCodeAssigner codeAssigner;

    public Page<InspectionPoint> list(UUID clientId, UUID areaId, UUID pointTypeId, PointStatus status,
                                       Pageable pageable) {
        Specification<InspectionPoint> spec = Specification.where(InspectionPointSpecifications.hasClient(clientId))
                .and(InspectionPointSpecifications.hasArea(areaId))
                .and(InspectionPointSpecifications.hasPointType(pointTypeId))
                .and(InspectionPointSpecifications.hasStatus(status));
        return inspectionPointRepository.findAll(spec, pageable);
    }

    public InspectionPoint getByCode(String code) {
        return inspectionPointRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Ponto de inspeção não encontrado: " + code));
    }

    public InspectionPoint getById(UUID id) {
        return inspectionPointRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Ponto de inspeção não encontrado: " + id));
    }

    /**
     * Não é @Transactional aqui de propósito: cada tentativa roda na sua própria
     * transação (REQUIRES_NEW) dentro de InspectionPointCodeAssigner, para que
     * uma tentativa que falhe por conflito de sequência não deixe a próxima
     * tentativa presa numa transação já abortada pelo Postgres.
     */
    public InspectionPoint create(InspectionPointCreateRequest request) {
        Area area = areaService.getByIdWithClient(request.getAreaId());
        PointType pointType = pointTypeService.getById(request.getPointTypeId());
        Unit unit = area.getUnit();
        Client client = unit.getClient();

        for (int attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
            try {
                return codeAssigner.attemptCreate(client, unit, area, pointType, request);
            } catch (DataIntegrityViolationException ex) {
                if (attempt == MAX_CODE_ATTEMPTS) {
                    break;
                }
            }
        }
        throw new ConflictException(
                "Não foi possível gerar um código único para o ponto de inspeção; tente novamente");
    }

    @Transactional
    public InspectionPoint update(UUID id, InspectionPointUpdateRequest request) {
        InspectionPoint point = getById(id);
        point.setLocationDescription(request.getLocationDescription());
        point.setDescription(request.getDescription());
        point.setCriticality(request.getCriticality());
        point.setStatus(request.getStatus());
        point.setReferencePhotoUrl(request.getReferencePhotoUrl());
        return point;
    }

    @Transactional
    public void delete(UUID id) {
        InspectionPoint point = getById(id);
        inspectionPointRepository.delete(point);
    }
}
