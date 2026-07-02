package com.smartlab.rastreabilidade.inspectionpoint;

import com.smartlab.rastreabilidade.area.Area;
import com.smartlab.rastreabilidade.client.Client;
import com.smartlab.rastreabilidade.inspectionpoint.dto.InspectionPointCreateRequest;
import com.smartlab.rastreabilidade.pointtype.PointType;
import com.smartlab.rastreabilidade.unit.Unit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Isolado num bean separado para que @Transactional(REQUIRES_NEW) funcione de
 * verdade: uma tentativa que falhar por violação da constraint única não pode
 * abortar a transação da tentativa seguinte (chamada via this.metodo() dentro
 * da mesma classe não passaria pelo proxy do Spring e o REQUIRES_NEW seria
 * ignorado).
 */
@Component
@RequiredArgsConstructor
public class InspectionPointCodeAssigner {

    private final InspectionPointRepository inspectionPointRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public InspectionPoint attemptCreate(Client client, Unit unit, Area area, PointType pointType,
                                          InspectionPointCreateRequest request) {
        int nextSequence =
                inspectionPointRepository.findMaxSequenceNumber(client.getId(), area.getId(), pointType.getId()) + 1;
        String code = "%s-SPDA-%s-%s-%03d".formatted(
                client.getAcronym(), area.getAcronym(), pointType.getAcronym(), nextSequence);

        InspectionPoint point = InspectionPoint.builder()
                .code(code)
                .client(client)
                .unit(unit)
                .area(area)
                .pointType(pointType)
                .sequenceNumber(nextSequence)
                .locationDescription(request.getLocationDescription())
                .description(request.getDescription())
                .criticality(request.getCriticality())
                .status(request.getStatus())
                .referencePhotoUrl(request.getReferencePhotoUrl())
                .build();

        return inspectionPointRepository.saveAndFlush(point);
    }
}
