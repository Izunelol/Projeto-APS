package com.smartlab.rastreabilidade.client;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    boolean existsByAcronymIgnoreCase(String acronym);

    Optional<Client> findByAcronymIgnoreCase(String acronym);
}
