package com.smartlab.rastreabilidade.area;

import com.smartlab.rastreabilidade.area.dto.AreaRequest;
import com.smartlab.rastreabilidade.common.ConflictException;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointCodeRegenerationService;
import com.smartlab.rastreabilidade.unit.Unit;
import com.smartlab.rastreabilidade.unit.UnitService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AreaService {

    private final AreaRepository areaRepository;
    private final UnitService unitService;
    private final InspectionPointCodeRegenerationService codeRegenerationService;

    public List<Area> listByUnit(UUID unitId) {
        unitService.getById(unitId);
        return areaRepository.findByUnitId(unitId);
    }

    public Area getById(UUID id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Área não encontrada: " + id));
    }

    /**
     * Busca a área já com unit + unit.client carregados (não-lazy), necessário
     * para quem precisa ler acronym/name dessas associações fora de uma sessão
     * Hibernate aberta (ex.: InspectionPointService, que roda a criação sem
     * @Transactional para permitir o retry de geração de código).
     */
    public Area getByIdWithClient(UUID id) {
        return areaRepository.findWithUnitAndClientById(id)
                .orElseThrow(() -> new NotFoundException("Área não encontrada: " + id));
    }

    @Transactional
    public Area create(UUID unitId, AreaRequest request) {
        Unit unit = unitService.getById(unitId);
        if (areaRepository.existsByUnitIdAndAcronymIgnoreCase(unitId, request.getAcronym())) {
            throw new ConflictException("Já existe uma área com a sigla " + request.getAcronym() + " para esta unidade");
        }
        Area area = Area.builder()
                .unit(unit)
                .name(request.getName())
                .acronym(request.getAcronym())
                .build();
        return areaRepository.save(area);
    }

    @Transactional
    public Area update(UUID id, AreaRequest request) {
        Area area = getById(id);
        boolean acronymChanged = !area.getAcronym().equalsIgnoreCase(request.getAcronym());
        if (acronymChanged
                && areaRepository.existsByUnitIdAndAcronymIgnoreCase(area.getUnit().getId(), request.getAcronym())) {
            throw new ConflictException("Já existe uma área com a sigla " + request.getAcronym() + " para esta unidade");
        }
        area.setName(request.getName());
        area.setAcronym(request.getAcronym());
        if (acronymChanged) {
            try {
                codeRegenerationService.regenerateCodesForArea(area.getId());
            } catch (DataIntegrityViolationException ex) {
                throw new ConflictException(
                        "Não foi possível atualizar a sigla: geraria códigos de ponto duplicados.");
            }
        }
        return area;
    }

    @Transactional
    public void delete(UUID id) {
        Area area = getById(id);
        areaRepository.delete(area);
    }
}
