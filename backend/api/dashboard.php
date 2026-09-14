<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

configurar_cors();

$pdo = conectar_bd();

try {
    $data_inicio = !empty($_GET['data_inicio']) ? $_GET['data_inicio'] : null;
    $data_fim    = !empty($_GET['data_fim']) ? $_GET['data_fim'] : null;
    $categoria   = isset($_GET['categoria_id']) && is_numeric($_GET['categoria_id'])
        ? (int)$_GET['categoria_id']
        : null;
    $conta       = isset($_GET['conta_id']) && is_numeric($_GET['conta_id'])
        ? (int)$_GET['conta_id']
        : null;
    $limite      = isset($_GET['limite']) && is_numeric($_GET['limite'])
        ? (int)$_GET['limite']
        : 50;
    $offset      = isset($_GET['offset']) && is_numeric($_GET['offset'])
        ? (int)$_GET['offset']
        : 0;

    $stmt = $pdo->prepare('CALL sp_dashboard(:data_inicio, :data_fim, :categoria, :conta, :limite, :offset)');
    $stmt->bindValue(':data_inicio', $data_inicio, $data_inicio === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':data_fim', $data_fim, $data_fim === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
    $stmt->bindValue(':categoria', $categoria, $categoria === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(':conta', $conta, $conta === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $transacoes = array_map(static function (array $t): array {
        $t['valor'] = (float)$t['valor'];
        return $t;
    }, $stmt->fetchAll());

    $stmt->nextRowset();
    $totais = $stmt->fetch() ?: [
        'total_receitas'  => 0,
        'total_despesas'  => 0,
        'saldo_liquido'   => 0,
        'total_transacoes'=> 0,
    ];
    $totais = array_map(static function (int|string $valor): int|float {
        return is_numeric($valor) ? (float)$valor : (int)$valor;
    }, $totais);

    $stmt->nextRowset();
    $por_categoria = $stmt->fetchAll();
    $por_categoria = array_map(static function (array $c): array {
        $c['total_despesas']    = (float)$c['total_despesas'];
        $c['total_receitas']    = (float)$c['total_receitas'];
        $c['total_transacoes']  = (int)$c['total_transacoes'];
        $c['categoria_id']      = (int)$c['categoria_id'];
        return $c;
    }, $por_categoria);

    while ($stmt->nextRowset()) {
    }

    responder_json([
        'success'       => true,
        'transacoes'    => $transacoes,
        'totais'        => $totais,
        'por_categoria' => $por_categoria,
    ]);
} catch (PDOException $e) {
    responder_json([
        'success' => false,
        'message' => 'Erro ao carregar os dados da dashboard.',
    ], 500);
}