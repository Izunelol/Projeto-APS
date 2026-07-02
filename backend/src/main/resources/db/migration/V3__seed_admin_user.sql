-- Usuário admin padrão para ambiente de desenvolvimento/demo.
-- Credenciais: admin@smartlab.com / admin1234 (hash BCrypt abaixo).
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Administrador', 'admin@smartlab.com', '$2a$10$66sFmb3P5wcdDvJ8f.DIhuBnVhu/hta1iX.qpcQ5W558S0blP4NuC', 'ADMIN');
