package com.smartlab.rastreabilidade.unit;

import com.smartlab.rastreabilidade.client.Client;
import com.smartlab.rastreabilidade.client.ClientService;
import com.smartlab.rastreabilidade.common.ConflictException;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.unit.dto.UnitRequest;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;
    private final ClientService clientService;

    public List<Unit> listByClient(UUID clientId) {
        clientService.getById(clientId);
        return unitRepository.findByClientId(clientId);
    }

    public Unit getById(UUID id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Unidade não encontrada: " + id));
    }

    @Transactional
    public Unit create(UUID clientId, UnitRequest request) {
        Client client = clientService.getById(clientId);
        if (unitRepository.existsByClientIdAndAcronymIgnoreCase(clientId, request.getAcronym())) {
            throw new ConflictException("Já existe uma unidade com a sigla " + request.getAcronym() + " para este cliente");
        }
        Unit unit = Unit.builder()
                .client(client)
                .name(request.getName())
                .acronym(request.getAcronym())
                .build();
        return unitRepository.save(unit);
    }

    @Transactional
    public Unit update(UUID id, UnitRequest request) {
        Unit unit = getById(id);
        if (!unit.getAcronym().equalsIgnoreCase(request.getAcronym())
                && unitRepository.existsByClientIdAndAcronymIgnoreCase(unit.getClient().getId(), request.getAcronym())) {
            throw new ConflictException("Já existe uma unidade com a sigla " + request.getAcronym() + " para este cliente");
        }
        unit.setName(request.getName());
        unit.setAcronym(request.getAcronym());
        return unit;
    }

    @Transactional
    public void delete(UUID id) {
        Unit unit = getById(id);
        unitRepository.delete(unit);
    }
}
