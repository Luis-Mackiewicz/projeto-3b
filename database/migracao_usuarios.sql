

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

ALTER TABLE categorias ADD COLUMN usuario_id INT NULL AFTER id;
ALTER TABLE contas ADD COLUMN usuario_id INT NULL AFTER id;
ALTER TABLE transacoes ADD COLUMN usuario_id INT NULL AFTER id;

ALTER TABLE categorias ADD CONSTRAINT fk_categorias_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON UPDATE CASCADE;
ALTER TABLE contas ADD CONSTRAINT fk_contas_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON UPDATE CASCADE;
ALTER TABLE transacoes ADD CONSTRAINT fk_transacoes_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON UPDATE CASCADE;

ALTER TABLE categorias DROP INDEX uk_categorias_nome;
ALTER TABLE categorias ADD UNIQUE KEY uk_categorias_usuario_nome (usuario_id, nome);
ALTER TABLE contas DROP INDEX uk_contas_nome;
ALTER TABLE contas ADD UNIQUE KEY uk_contas_usuario_nome (usuario_id, nome);

ALTER TABLE categorias ADD INDEX idx_categorias_usuario (usuario_id);
ALTER TABLE contas ADD INDEX idx_contas_usuario (usuario_id);
ALTER TABLE transacoes ADD INDEX idx_transacoes_usuario (usuario_id);

DELIMITER $$

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
