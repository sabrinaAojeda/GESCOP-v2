<?php
// BACKEND/api/personal/get_personal.php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once dirname(__FILE__) . '/../../config/database.php';
require_once dirname(__FILE__) . '/../../../models/Personal.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $personal = new Personal($db);
    
    // Obtener parámetros
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $sector = isset($_GET['sector']) ? $_GET['sector'] : '';
    $estado = isset($_GET['estado']) ? $_GET['estado'] : '';
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    $offset = ($page - 1) * $limit;
    
    // Si se solicita un ID específico
    if ($id) {
        $personal->id = $id;
        if ($personal->leerUno()) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $personal->id,
                    'nombre' => $personal->nombre,
                    'apellido' => $personal->apellido,
                    'dni' => $personal->dni,
                    'telefono' => $personal->telefono,
                    'email' => $personal->email,
                    'sector' => $personal->sector,
                    'puesto' => $personal->puesto,
                    'cargo' => $personal->puesto,
                    'fecha_ingreso' => $personal->fecha_ingreso,
                    'estado' => $personal->activo == 1 ? 'Activo' : 'Inactivo',
                    'created_at' => $personal->created_at
                ]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Personal no encontrado'
            ]);
        }
        exit();
    }
    
    // Obtener con filtros
    $stmt = $personal->leerConFiltros($search, $sector, $estado, $limit, $offset);
    $total = $personal->contarConFiltros($search, $sector, $estado);
    
    $personal_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $personal_item = [
            'id' => $row['id'],
            'legajo' => 'P' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
            'nombre' => $row['nombre'],
            'apellido' => $row['apellido'],
            'dni' => $row['dni'],
            'telefono' => $row['telefono'],
            'email' => $row['email'],
            'sector' => $row['sector'],
            'puesto' => $row['puesto'],
            'cargo' => $row['puesto'],
            'fecha_ingreso' => $row['fecha_ingreso'],
            'estado' => $row['activo'] == 1 ? 'Activo' : 'Inactivo',
            'created_at' => $row['created_at']
        ];
        array_push($personal_arr, $personal_item);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $personal_arr,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>