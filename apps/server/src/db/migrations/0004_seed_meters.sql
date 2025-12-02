-- Custom SQL migration file, put your code below! --
WITH new_meters (id, name, ip, description, active) AS (
    VALUES
        (10, 'Ar-Condicionados', '172.21.65.25', 'Medidor dos ar-condicionados do auditório.', TRUE),
        (12, 'Biblioteca', '172.21.65.21', 'Medidor de consumo da biblioteca.', TRUE),
        (13, 'Elevador', '172.21.65.11', 'Medidor responsável pelo consumo do elevador.', TRUE),
        (14, 'Geral', '172.21.65.23', 'Medidor geral do prédio.', TRUE),
        (11, 'Iluminação', '172.21.65.18', 'Medidor da iluminação do auditório.', TRUE),
        (1,  'Medidor 1º Andar', '172.21.65.26', 'Medidor localizado no segundo andar, perto do banheiro.', TRUE),
        (3,  'Medidor 1º Andar', '172.21.65.15', 'Medidor localizado no primeiro andar, no fundo do corredor.', TRUE),
        (2,  'Medidor 1º Andar', '172.21.65.19', 'Medidor localizado no primeiro andar, no meio do corredor.', TRUE),
        (4,  'Medidor 2º Andar', '172.21.65.13', 'Medidor localizado no segundo andar, no meio do corredor.', TRUE),
        (6,  'Medidor 2º Andar', '172.21.65.22', 'Medidor localizado no segundo andar, perto do banheiro.', TRUE),
        (5,  'Medidor 2º Andar', '172.21.65.17', 'Medidor localizado no segundo andar, no fundo do corredor.', TRUE),
        (8,  'Medidor 3º Andar', '172.21.65.20', 'Medidor localizado no terceiro andar, no fundo do corredor.', TRUE),
        (7,  'Medidor 3º Andar', '172.21.65.14', 'Medidor localizado no terceiro andar, no meio do corredor.', TRUE),
        (9,  'Medidor 3º Andar', '172.21.65.12', 'Medidor localizado no terceiro andar, perto do banheiro.', TRUE)
)
INSERT INTO meters (id, name, ip, description, active)
SELECT id, name, ip, description, active
FROM new_meters
WHERE NOT EXISTS (SELECT 1 FROM meters);
