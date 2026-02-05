<?php
header("Content-Type: application/json; charset=UTF-8");

// Usar paths absolutos para evitar problemas de include
$base_path = dirname(__FILE__, 3); // public_html/
require_once $base_path . '/config/database.php';
require_once $base_path . '/models/Parametro.php';

$database = new Database();
$db = $database->getConnection();
$parametro = new Parametro($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            $tipo = $_GET['tipo'] ?? '';
            $id = $_GET['id'] ?? null;
            
            if ($id) {
                // Obtener un parámetro específico
                $parametro->id = $id;
                if ($parametro->leerUno()) {
                    sendResponse(true, 'Parámetro encontrado', [
                        'id' => $parametro->id,
                        'tipo' => $parametro->tipo,
                        'codigo' => $parametro->codigo,
                        'valor' => $parametro->valor,
                        'descripcion' => $parametro->descripcion,
                        'orden' => $parametro->orden,
                        'activo' => $parametro->activo,
                        'created_at' => $parametro->created_at,
                        'updated_at' => $parametro->updated_at
                    ]);
                } else {
                    sendResponse(false, 'Parámetro no encontrado', null, 404);
                }
            } elseif ($tipo) {
                // Obtener parámetros por tipo
                $stmt = $parametro->obtenerPorTipo($tipo);
                $parametros = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $parametros[] = $row;
                }
                sendResponse(true, 'Parámetros obtenidos', $parametros);
            } else {
                // Obtener todos los parámetros
                $stmt = $parametro->leer();
                $parametros = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $parametros[] = $row;
                }
                sendResponse(true, 'Parámetros obtenidos', $parametros);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || empty($data->tipo) || empty($data->valor)) {
                sendResponse(false, 'Datos incompletos. Tipo y valor son requeridos.', null, 400);
            }
            
            $parametro->tipo = $data->tipo;
            $parametro->codigo = $data->codigo ?? '';
            $parametro->valor = $data->valor;
            $parametro->descripcion = $data->descripcion ?? '';
            $parametro->orden = $data->orden ?? 0;
            $parametro->activo = $data->activo ?? 1;
            
            if ($parametro->crear()) {
                sendResponse(true, 'Parámetro creado exitosamente', null, 201);
            } else {
                sendResponse(false, 'No se pudo crear el parámetro', null, 500);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || empty($data->id)) {
                sendResponse(false, 'ID requerido', null, 400);
            }
            
            $parametro->id = $data->id;
            
            // Primero leer el parámetro existente
            if (!$parametro->leerUno()) {
                sendResponse(false, 'Parámetro no encontrado', null, 404);
            }
            
            // Actualizar solo los campos proporcionados
            if (isset($data->tipo)) $parametro->tipo = $data->tipo;
            if (isset($data->codigo)) $parametro->codigo = $data->codigo;
            if (isset($data->valor)) $parametro->valor = $data->valor;
            if (isset($data->descripcion)) $parametro->descripcion = $data->descripcion;
            if (isset($data->orden)) $parametro->orden = $data->orden;
            if (isset($data->activo)) $parametro->activo = $data->activo;
            
            if ($parametro->actualizar()) {
                sendResponse(true, 'Parámetro actualizado exitosamente');
            } else {
                sendResponse(false, 'No se pudo actualizar el parámetro', null, 500);
            }
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || empty($data->id)) {
                sendResponse(false, 'ID requerido', null, 400);
            }
            
            $parametro->id = $data->id;
            
            if ($parametro->eliminar()) {
                sendResponse(true, 'Parámetro eliminado exitosamente');
            } else {
                sendResponse(false, 'No se pudo eliminar el parámetro', null, 500);
            }
            break;

        default:
            sendResponse(false, 'Método no permitido', null, 405);
            break;
    }
} catch (Exception $e) {
    error_log("Error en parámetros.php: " . $e->getMessage());
    sendResponse(false, 'Error interno del servidor: ' . $e->getMessage(), null, 500);
}
?>