package com.smartlab.rastreabilidade.inspectionpoint;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * O código de um InspectionPoint ({CLIENTE}-SPDA-{AREA}-{TIPO}-{SEQ}) é texto
 * literal gravado na criação, não derivado dinamicamente das siglas atuais de
 * Client/Area/PointType. Quando uma dessas siglas é renomeada, os códigos já
 * gerados ficam desatualizados a menos que sejam recompostos aqui.
 *
 * Fica num Component próprio (só depende de InspectionPointRepository) para
 * que ClientService/AreaService/PointTypeService possam injetá-lo sem criar
 * dependência circular com InspectionPointService (que por sua vez depende de
 * AreaService/PointTypeService).
 */
@Component
@RequiredArgsConstructor
public class InspectionPointCodeRegenerationService {

    private final InspectionPointRepository inspectionPointRepository;

    @Transactional
    public void regenerateCodesForClient(UUID clientId) {
        regenerate(inspectionPointRepository.findByClientId(clientId));
    }

    @Transactional
    public void regenerateCodesForArea(UUID areaId) {
        regenerate(inspectionPointRepository.findByAreaId(areaId));
    }

    @Transactional
    public void regenerateCodesForPointType(UUID pointTypeId) {
        regenerate(inspectionPointRepository.findByPointTypeId(pointTypeId));
    }

    private void regenerate(List<InspectionPoint> points) {
        for (InspectionPoint point : points) {
            String newCode = "%s-SPDA-%s-%s-%03d".formatted(
                    point.getClient().getAcronym(),
                    point.getArea().getAcronym(),
                    point.getPointType().getAcronym(),
                    point.getSequenceNumber());
            point.setCode(newCode);
        }
        // flush dentro deste método (chamado a partir da transação do caller, ex.
        // ClientService.update) para que uma eventual violação da constraint única
        // de `code` seja lançada aqui e possa ser traduzida em ConflictException
        // pelo caller, revertendo também a mudança de sigla na mesma transação.
        inspectionPointRepository.flush();
    }
}
