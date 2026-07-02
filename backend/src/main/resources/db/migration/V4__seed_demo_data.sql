-- Dados de demonstração: cliente Raízen, unidades/áreas e ≥15 pontos de
-- inspeção com ≥14 inspeções, para as telas de Pontos/Ficha do Ponto/Nova
-- Inspeção/Dashboard terem dados reais para exibir.
--
-- Nota: as inspeções com inspection_date = CURRENT_DATE só aparecem em
-- "Inspeções Hoje" no dia em que esta migration rodar pela primeira vez
-- contra o banco (CURRENT_DATE é avaliado uma única vez, na execução da
-- migration, não recalculado depois). Num ambiente que já rodou a migration
-- há dias, esse indicador vai refletir 0 a menos que uma inspeção real seja
-- registrada no dia via a aplicação.

INSERT INTO clients (id, name, acronym) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Raízen', 'RZ');

INSERT INTO units (id, client_id, name, acronym) VALUES
    ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Unidade Industrial', 'UI'),
    ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Terminal Portuário', 'TP');

INSERT INTO areas (id, unit_id, name, acronym) VALUES
    ('11111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111112', 'Tanques', 'TQ'),
    ('11111111-1111-1111-1111-111111111122', '11111111-1111-1111-1111-111111111112', 'Subestação', 'SE'),
    ('11111111-1111-1111-1111-111111111123', '11111111-1111-1111-1111-111111111112', 'Administrativo', 'ADM'),
    ('11111111-1111-1111-1111-111111111124', '11111111-1111-1111-1111-111111111113', 'Malha Externa', 'ME');

INSERT INTO inspection_points
    (id, code, client_id, unit_id, area_id, point_type_id, sequence_number, location_description, criticality, status)
VALUES
    ('11111111-1111-1111-1111-111111111201', 'RZ-SPDA-TQ-CI-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'CI'), 1, 'Próximo ao Tanque 09', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111202', 'RZ-SPDA-TQ-CI-002', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'CI'), 2, 'Próximo ao Tanque 12', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111203', 'RZ-SPDA-TQ-CI-003', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'CI'), 3, 'Próximo ao Tanque 14', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111204', 'RZ-SPDA-TQ-TQAT-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'TQAT'), 1, 'Topo do tanque atmosférico 03', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111205', 'RZ-SPDA-TQ-DESC-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'DESC'), 1, 'Descida oeste do dique de contenção', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111206', 'RZ-SPDA-TQ-DESC-002', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111121', (SELECT id FROM point_types WHERE acronym = 'DESC'), 2, 'Descida leste do dique de contenção', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111207', 'RZ-SPDA-SE-EQP-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111122', (SELECT id FROM point_types WHERE acronym = 'EQP'), 1, 'Painel de equipotencialização A', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111208', 'RZ-SPDA-SE-EQP-002', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111122', (SELECT id FROM point_types WHERE acronym = 'EQP'), 2, 'Painel de equipotencialização B', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111209', 'RZ-SPDA-SE-MALHA-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111122', (SELECT id FROM point_types WHERE acronym = 'MALHA'), 1, 'Acesso à malha, quadro geral', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111210', 'RZ-SPDA-SE-CAP-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111122', (SELECT id FROM point_types WHERE acronym = 'CAP'), 1, 'Captor do transformador principal', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111211', 'RZ-SPDA-ADM-HC-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111123', (SELECT id FROM point_types WHERE acronym = 'HC'), 1, 'Cobertura do prédio administrativo', 'BAIXA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111212', 'RZ-SPDA-ADM-ISO-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111123', (SELECT id FROM point_types WHERE acronym = 'ISO'), 1, 'Fixação de condutor, fachada norte', 'BAIXA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111213', 'RZ-SPDA-ADM-CON-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111123', (SELECT id FROM point_types WHERE acronym = 'CON'), 1, 'Emenda próxima à guarita', 'BAIXA', 'INATIVO'),
    ('11111111-1111-1111-1111-111111111214', 'RZ-SPDA-ME-MALHA-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111124', (SELECT id FROM point_types WHERE acronym = 'MALHA'), 1, 'Malha externa, setor norte do píer', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111215', 'RZ-SPDA-ME-MALHA-002', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111124', (SELECT id FROM point_types WHERE acronym = 'MALHA'), 2, 'Malha externa, setor sul do píer', 'ALTA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111216', 'RZ-SPDA-ME-POSTE-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111124', (SELECT id FROM point_types WHERE acronym = 'POSTE'), 1, 'Poste de iluminação do pátio 02', 'MEDIA', 'ATIVO'),
    ('11111111-1111-1111-1111-111111111217', 'RZ-SPDA-ME-EM-001', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111124', (SELECT id FROM point_types WHERE acronym = 'EM'), 1, 'Emenda da descida principal do píer', 'MEDIA', 'ATIVO');

INSERT INTO inspections
    (inspection_point_id, inspection_date, responsible_name, inspector_id, visual_condition,
     electrical_continuity_mohm, grounding_resistance_ohm, has_oxidation, needs_correction, is_conforming, observations)
VALUES
    ('11111111-1111-1111-1111-111111111201', CURRENT_DATE - 20, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 4.20, 3.10, false, false, true, 'Sem anomalias visuais.'),
    ('11111111-1111-1111-1111-111111111201', CURRENT_DATE - 3, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'REGULAR', 5.80, 4.40, true, false, true, 'Início de oxidação leve nos conectores.'),
    ('11111111-1111-1111-1111-111111111202', CURRENT_DATE - 10, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 3.90, 2.80, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111203', CURRENT_DATE, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 4.10, 3.00, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111204', CURRENT_DATE - 5, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'REGULAR', 6.30, 5.10, false, true, true, 'Recomenda-se reaperto dos terminais.'),
    ('11111111-1111-1111-1111-111111111205', CURRENT_DATE - 8, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'RUIM', 12.40, 9.80, true, true, false, 'Corrosão avançada na descida, necessita substituição.'),
    ('11111111-1111-1111-1111-111111111207', CURRENT_DATE - 30, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 2.90, 1.90, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111207', CURRENT_DATE, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 3.00, 2.00, false, false, true, 'Manutenção preventiva concluída.'),
    ('11111111-1111-1111-1111-111111111208', CURRENT_DATE - 15, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 3.40, 2.60, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111209', CURRENT_DATE - 6, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'REGULAR', 5.20, 4.00, false, false, true, 'Vegetação próxima ao ponto de acesso.'),
    ('11111111-1111-1111-1111-111111111210', CURRENT_DATE - 12, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'RUIM', 15.70, 11.20, true, true, false, 'Captor danificado, abrir OS de correção.'),
    ('11111111-1111-1111-1111-111111111211', CURRENT_DATE - 4, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 3.10, 2.20, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111212', CURRENT_DATE - 9, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 2.80, 1.70, false, false, true, NULL),
    ('11111111-1111-1111-1111-111111111214', CURRENT_DATE - 2, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'REGULAR', 6.90, 5.60, false, false, true, 'Exposição salina, monitorar em 30 dias.'),
    ('11111111-1111-1111-1111-111111111215', CURRENT_DATE - 1, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'RUIM', 18.30, 13.50, true, true, false, 'Corrosão severa por maresia, correção urgente.'),
    ('11111111-1111-1111-1111-111111111216', CURRENT_DATE - 7, 'Eng. Ricardo Silva', (SELECT id FROM users WHERE email = 'admin@smartlab.com'), 'BOA', 3.60, 2.50, false, false, true, NULL);
