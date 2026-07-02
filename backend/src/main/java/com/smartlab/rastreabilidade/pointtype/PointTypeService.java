package com.smartlab.rastreabilidade.pointtype;

import com.smartlab.rastreabilidade.common.ConflictException;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.pointtype.dto.PointTypeRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PointTypeService {

    private final PointTypeRepository pointTypeRepository;

    public Page<PointType> list(Pageable pageable) {
        return pointTypeRepository.findAll(pageable);
    }

    public PointType getById(UUID id) {
        return pointTypeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tipo de ponto não encontrado: " + id));
    }

    @Transactional
    public PointType create(PointTypeRequest request) {
        if (pointTypeRepository.existsByAcronymIgnoreCase(request.getAcronym())) {
            throw new ConflictException("Já existe um tipo de ponto com a sigla " + request.getAcronym());
        }
        PointType pointType = PointType.builder()
                .name(request.getName())
                .acronym(request.getAcronym())
                .description(request.getDescription())
                .build();
        return pointTypeRepository.save(pointType);
    }

    @Transactional
    public PointType update(UUID id, PointTypeRequest request) {
        PointType pointType = getById(id);
        if (!pointType.getAcronym().equalsIgnoreCase(request.getAcronym())
                && pointTypeRepository.existsByAcronymIgnoreCase(request.getAcronym())) {
            throw new ConflictException("Já existe um tipo de ponto com a sigla " + request.getAcronym());
        }
        pointType.setName(request.getName());
        pointType.setAcronym(request.getAcronym());
        pointType.setDescription(request.getDescription());
        return pointType;
    }

    @Transactional
    public void delete(UUID id) {
        PointType pointType = getById(id);
        pointTypeRepository.delete(pointType);
    }
}
