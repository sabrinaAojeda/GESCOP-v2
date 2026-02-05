<?php
// BACKEND/controllers/personalController.php
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Personal.php';

$database = new Database();
$db = $database->getConnection();

$personal = new Personal($db);

// Determinar método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Manejar OPTIONS para CORS
if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        // Leer personal con filtros
        if (isset($_GET['id'])) {
            // Leer un solo personal
            $personal->id = $_GET['id'];
            if ($personal->leerUno()) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'id' => $personal->id,
                        'nombre' => $personal->nombre,
                        'apellido' => $personal->apellido,
                        'dni' => $personal->dni,
                        'telefono' => $personal->telefono,
                        'email' => $personal->email,
                        'puesto' => $personal->puesto,
                        'sector' => $personal->sector,
                        'fecha_ingreso' => $personal->fecha_ingreso,
                        'activo' => $personal->activo,
                        'created_at' => $personal->created_at
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Personal no encontrado']);
            }
        } else {
            // Listar con filtros y paginación
            $search = $_GET['search'] ?? '';
            $sector = $_GET['sector'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Contar total
            $total = $personal->contarConFiltros($search, $sector, $estado);
            $total_pages = ceil($total / $limit);
            
            // Obtener datos
            $stmt = $personal->leerConFiltros($search, $sector, $estado, $limit, $offset);
            $personal_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatear respuesta
            $resultados = [];
            foreach ($personal_data as $row) {
                $resultados[] = [
                    'id' => $row['id'],
                    'legajo' => 'P' . str_pad($row['id'], 4, '0', STR_PAD_LEFT),
                    'nombre' => $row['nombre'],
                    'apellido' => $row['apellido'],
                    'dni' => $row['dni'],
                    'telefono' => $row['telefono'],
                    'email' => $row['email'],
                    'cargo' => $row['puesto'],
                    'sector' => $row['sector'],
                    'estado' => $row['activo'] ? 'Activo' : 'Inactivo',
                    'fecha_ingreso' => $row['fecha_ingreso'],
                    'created_at' => $row['created_at']
                ];
            }
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $resultados,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => $total_pages
                ]
            ]);
        }
        break;
        
    case 'POST':
        // Crear nuevo personal
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->nombre) && !empty($data->apellido) && !empty($data->dni)) {
            $personal->nombre = $data->nombre;
            $personal->apellido = $data->apellido;
            $personal->dni = $data->dni;
            $personal->telefono = $data->telefono ?? '';
            $personal->email = $data->email ?? '';
            $personal->puesto = $data->cargo ?? $data->puesto ?? '';
            $personal->sector = $data->sector ?? '';
            $personal->fecha_ingreso = $data->fecha_ingreso ?? date('Y-m-d');
            $personal->activo = 1;
            
            if ($personal->crear()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Personal creado exitosamente',
                    'id' => $personal->id
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Error al crear el personal']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
        }
        break;
        
    case 'PUT':
        // Actualizar personal
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $personal->id = $data->id;
            
            // Primero verificar que existe
            if ($personal->leerUno()) {
                $personal->nombre = $data->nombre ?? $personal->nombre;
                $personal->apellido = $data->apellido ?? $personal->apellido;
                $personal->dni = $data->dni ?? $personal->dni;
                $personal->telefono = $data->telefono ?? $personal->telefono;
                $personal->email = $data->email ?? $personal->email;
                $personal->puesto = $data->cargo ?? $data->puesto ?? $personal->puesto;
                $personal->sector = $data->sector ?? $personal->sector;
                $personal->fecha_ingreso = $data->fecha_ingreso ?? $personal->fecha_ingreso;
                $personal->activo = isset($data->estado) ? ($data->estado === 'Activo' ? 1 : 0) : $personal->activo;
                
                if ($personal->actualizar()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Personal actualizado exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al actualizar el personal']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Personal no encontrado']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID no especificado']);
        }
        break;
        
    case 'DELETE':
        // Eliminar personal (eliminación lógica)
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $personal->id = $data->id;
            
            if ($personal->leerUno()) {
                if ($personal->eliminar()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Personal eliminado exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al eliminar el personal']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Personal no encontrado']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID no especificado']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        break;
}
?>