

CREATE DATABASE IF NOT EXISTS projeto_3b
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE projeto_3b;



CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuarios_email (email)
) ENGINE=InnoDB;



CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NULL,
  tipo ENUM('receita', 'despesa') NOT NULL DEFAULT 'despesa',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_categorias_usuario_nome (usuario_id, nome),
  CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE CASCADE,
  INDEX idx_categorias_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nome VARCHAR(100) NOT NULL,
  tipo ENUM('corrente', 'poupanca', 'credito') NOT NULL DEFAULT 'corrente',
  saldo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_contas_usuario_nome (usuario_id, nome),
  CONSTRAINT fk_contas_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE CASCADE,
  INDEX idx_contas_usuario (usuario_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  conta_id INT NOT NULL,
  categoria_id INT NOT NULL,
  descricao VARCHAR(150) NOT NULL,
  valor DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tipo ENUM('receita', 'despesa') NOT NULL DEFAULT 'despesa',
  data_transacao DATE NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transacao_conta FOREIGN KEY (conta_id)
    REFERENCES contas (id) ON UPDATE CASCADE,
  CONSTRAINT fk_transacao_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (id) ON UPDATE CASCADE,
  CONSTRAINT fk_transacoes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id) ON UPDATE CASCADE,
  INDEX idx_transacoes_data (data_transacao),
  INDEX idx_transacoes_categoria (categoria_id),
  INDEX idx_transacoes_conta (conta_id),
  INDEX idx_transacoes_usuario (usuario_id)
) ENGINE=InnoDB;



DELIMITER $$

DROP TRIGGER IF EXISTS trg_transacoes_before_update$$

CREATE TRIGGER trg_transacoes_before_update
BEFORE UPDATE ON transacoes
FOR EACH ROW
BEGIN
  SET NEW.valor = ABS(NEW.valor);
END$$

DROP TRIGGER IF EXISTS trg_transacoes_before_insert$$

CREATE TRIGGER trg_transacoes_before_insert
BEFORE INSERT ON transacoes
FOR EACH ROW
BEGIN
  SET NEW.valor = ABS(NEW.valor);
END$$



DROP FUNCTION IF EXISTS fn_calcular_imposto$$

CREATE FUNCTION fn_calcular_imposto(
  p_valor DECIMAL(12,2),
  p_aliquota DECIMAL(5,4)
)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
  RETURN ROUND(p_valor * (1 + p_aliquota), 2);
END$$



DROP VIEW IF EXISTS vw_saldo_consolidado$$

CREATE VIEW vw_saldo_consolidado AS
WITH resumo_contas AS (
  SELECT
    t.conta_id,
    COALESCE(SUM(
      CASE
        WHEN t.tipo = 'receita' THEN t.valor
        ELSE 0
      END
    ), 0) AS total_receitas,
    COALESCE(SUM(
      CASE
        WHEN t.tipo = 'despesa' THEN t.valor
        ELSE 0
      END
    ), 0) AS total_despesas,
    COUNT(t.id) AS total_transacoes
  FROM transacoes t
  WHERE t.ativo = TRUE
  GROUP BY t.conta_id
)
SELECT
  c.id AS conta_id,
  c.nome AS conta,
  c.tipo AS tipo_conta,
  c.saldo AS saldo_inicial,
  COALESCE(rc.total_receitas, 0) AS total_receitas,
  COALESCE(rc.total_despesas, 0) AS total_despesas,
  COALESCE(rc.total_transacoes, 0) AS total_transacoes,
  (c.saldo + COALESCE(rc.total_receitas, 0) - COALESCE(rc.total_despesas, 0)) AS saldo_consolidado
FROM contas c
LEFT JOIN resumo_contas rc ON rc.conta_id = c.id
WHERE c.ativo = TRUE$$



DROP VIEW IF EXISTS vw_transacoes_completa$$

CREATE VIEW vw_transacoes_completa AS
SELECT
  t.id,
  t.descricao,
  t.valor,
  t.tipo,
  t.data_transacao,
  t.ativo,
  t.criado_em,
  c.id AS categoria_id,
  c.nome AS categoria_nome,
  c.tipo AS categoria_tipo,
  co.id AS conta_id,
  co.nome AS conta_nome,
  co.tipo AS conta_tipo
FROM transacoes t
INNER JOIN categorias c ON c.id = t.categoria_id
INNER JOIN contas co ON co.id = t.conta_id$$



DROP PROCEDURE IF EXISTS sp_dashboard$$

CREATE PROCEDURE sp_dashboard(
  IN p_usuario_id INT,
  IN p_data_inicio DATE,
  IN p_data_fim DATE,
  IN p_categoria_id INT,
  IN p_conta_id INT,
  IN p_limite INT,
  IN p_offset INT
)
BEGIN
  SET @data_inicio  = p_data_inicio;
  SET @data_fim     = p_data_fim;
  SET @categoria_id = p_categoria_id;
  SET @conta_id     = p_conta_id;
  SET @limite       = IFNULL(p_limite, 50);
  SET @offset       = IFNULL(p_offset, 0);

  SET @sql_lista = CONCAT(
    'SELECT
      t.id, t.descricao, t.valor, t.tipo, t.data_transacao,
      t.conta_id, co.nome AS conta_nome,
      t.categoria_id, c.nome AS categoria_nome
    FROM transacoes t
    INNER JOIN categorias c ON c.id = t.categoria_id
    INNER JOIN contas co ON co.id = t.conta_id
    WHERE t.ativo = TRUE
      AND t.usuario_id = ', p_usuario_id, '
      AND (@data_inicio IS NULL OR t.data_transacao >= @data_inicio)
      AND (@data_fim IS NULL OR t.data_transacao <= @data_fim)
      AND (@categoria_id IS NULL OR t.categoria_id = @categoria_id)
      AND (@conta_id IS NULL OR t.conta_id = @conta_id)
    ORDER BY t.data_transacao DESC, t.id DESC
    LIMIT ', @limite, ' OFFSET ', @offset
  );

  PREPARE stmt_lista FROM @sql_lista;
  EXECUTE stmt_lista;
  DEALLOCATE PREPARE stmt_lista;

  SELECT
    COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE 0 END), 0) AS total_receitas,
    COALESCE(SUM(CASE WHEN t.tipo = 'despesa' THEN t.valor ELSE 0 END), 0) AS total_despesas,
    COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE -t.valor END), 0) AS saldo_liquido,
    COUNT(t.id) AS total_transacoes
  FROM transacoes t
  WHERE t.ativo = TRUE
    AND t.usuario_id = p_usuario_id
    AND (p_data_inicio IS NULL OR t.data_transacao >= p_data_inicio)
    AND (p_data_fim IS NULL OR t.data_transacao <= p_data_fim)
    AND (p_categoria_id IS NULL OR t.categoria_id = p_categoria_id)
    AND (p_conta_id IS NULL OR t.conta_id = p_conta_id);

  SELECT
    c.id AS categoria_id,
    c.nome AS categoria_nome,
    COALESCE(SUM(CASE WHEN t.tipo = 'despesa' THEN t.valor ELSE 0 END), 0) AS total_despesas,
    COALESCE(SUM(CASE WHEN t.tipo = 'receita' THEN t.valor ELSE 0 END), 0) AS total_receitas,
    COUNT(t.id) AS total_transacoes
  FROM categorias c
  LEFT JOIN transacoes t
        ON t.categoria_id = c.id
       AND t.ativo = TRUE
       AND t.usuario_id = p_usuario_id
       AND (p_data_inicio IS NULL OR t.data_transacao >= p_data_inicio)
       AND (p_data_fim IS NULL OR t.data_transacao <= p_data_fim)
       AND (p_conta_id IS NULL OR t.conta_id = p_conta_id)
  WHERE c.usuario_id = p_usuario_id
  GROUP BY c.id, c.nome
  HAVING total_despesas > 0 OR total_receitas > 0
  ORDER BY total_despesas DESC, total_receitas DESC;
END$$

DELIMITER ;

