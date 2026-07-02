package com.smartlab.rastreabilidade.client;

import com.smartlab.rastreabilidade.client.dto.ClientRequest;
import com.smartlab.rastreabilidade.common.ConflictException;
import com.smartlab.rastreabilidade.common.NotFoundException;
import com.smartlab.rastreabilidade.inspectionpoint.InspectionPointCodeRegenerationService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final InspectionPointCodeRegenerationService codeRegenerationService;

    public Page<Client> list(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }

    public Client getById(UUID id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente não encontrado: " + id));
    }

    @Transactional
    public Client create(ClientRequest request) {
        if (clientRepository.existsByAcronymIgnoreCase(request.getAcronym())) {
            throw new ConflictException("Já existe um cliente com a sigla " + request.getAcronym());
        }
        Client client = Client.builder()
                .name(request.getName())
                .acronym(request.getAcronym())
                .build();
        return clientRepository.save(client);
    }

    @Transactional
    public Client update(UUID id, ClientRequest request) {
        Client client = getById(id);
        boolean acronymChanged = !client.getAcronym().equalsIgnoreCase(request.getAcronym());
        if (acronymChanged && clientRepository.existsByAcronymIgnoreCase(request.getAcronym())) {
            throw new ConflictException("Já existe um cliente com a sigla " + request.getAcronym());
        }
        client.setName(request.getName());
        client.setAcronym(request.getAcronym());
        if (acronymChanged) {
            try {
                codeRegenerationService.regenerateCodesForClient(client.getId());
            } catch (DataIntegrityViolationException ex) {
                throw new ConflictException(
                        "Não foi possível atualizar a sigla: geraria códigos de ponto duplicados.");
            }
        }
        return client;
    }

    @Transactional
    public void delete(UUID id) {
        Client client = getById(id);
        clientRepository.delete(client);
    }
}
