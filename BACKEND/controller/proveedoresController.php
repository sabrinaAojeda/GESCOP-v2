<?php
// BACKEND/controllers/proveedoresController.php - CORREGIDO para usar BD real
header('Content-Type: application/json');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once '../config/database.php';
require_once '../models/Proveedor.php';

$database = new Database();
$db = $database->getConnection();

$proveedor = new Proveedor($db);
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Función auxiliar para enviar respuestas
function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Leer un proveedor específico
                $proveedor->id = $_GET['id'];
                if ($proveedor->leerUno()) {
                    sendResponse(true, 'Proveedor encontrado', [
                        'id' => $proveedor->id,
                        'codigo' => $proveedor->codigo,
                        'razon_social' => $proveedor->razon_social,
                        'cuit' => $proveedor->cuit,
                        'rubro' => $proveedor->rubro,
                        'direccion' => $proveedor->direccion,
                        'localidad' => $proveedor->localidad,
                        'provincia' => $proveedor->provincia,
                        'telefono' => $proveedor->telefono,
                        'email' => $proveedor->email,
                        'contacto_nombre' => $proveedor->contacto_nombre,
                        'contacto_cargo' => $proveedor->contacto_cargo,
                        'estado' => $proveedor->estado,
                        'seguro_RT' => $proveedor->seguro_RT,
                        'habilitacion_personal' => $proveedor->habilitacion_personal,
                        'habilitacion_vehiculo' => $proveedor->habilitacion_vehiculo,
                        'sector_servicio' => $proveedor->campos_personalizados['sector_servicio'] ?? '',
                        'tipo_proveedor' => $proveedor->campos_personalizados['tipo_proveedor'] ?? '',
                        'personal_contratado' => $proveedor->campos_personalizados['personal_contratado'] ?? [],
                        'vencimiento_documentacion' => $proveedor->campos_personalizados['vencimiento_documentacion'] ?? null,
                        'subcategoria' => $proveedor->campos_personalizados['subcategoria'] ?? '',
                        'created_at' => $proveedor->created_at,
                        'updated_at' => $proveedor->updated_at
                    ]);
                } else {
                    sendResponse(false, 'Proveedor no encontrado', null, 404);
                }
            } else {
                // Listar con filtros y paginación - USANDO BD REAL
                $search = $_GET['search'] ?? '';
                $rubro = $_GET['rubro'] ?? '';
                $estado = $_GET['estado'] ?? '';
                $localidad = $_GET['localidad'] ?? '';
                $sector_servicio = $_GET['sector_servicio'] ?? '';
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;
                
                // Usar método leerConFiltros del modelo
                $stmt = $proveedor->leerConFiltros($search, $rubro, $estado, $limit, $offset);
                $proveedores_data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $total = $proveedor->contarConFiltros($search, $rubro, $estado);
                $total_pages = ceil($total / $limit);
                
                // Formatear datos para frontend
                $proveedores_formateados = [];
                foreach ($proveedores_data as $row) {
                    $proveedores_formateados[] = [
                        'id' => $row['id'],
                        'codigo' => $row['codigo'],
                        'razon_social' => $row['razon_social'],
                        'cuit' => $row['cuit'],
                        'rubro' => $row['rubro'],
                        'direccion' => $row['direccion'],
                        'localidad' => $row['localidad'],
                        'provincia' => $row['provincia'],
                        'telefono' => $row['telefono'],
                        'email' => $row['email'],
                        'contacto_nombre' => $row['contacto_nombre'],
                        'contacto_cargo' => $row['contacto_cargo'],
                        'estado' => $row['estado'],
                        'seguro_RT' => (bool)$row['seguro_RT'],
                        'habilitacion_personal' => $row['habilitacion_personal'],
                        'habilitacion_vehiculo' => $row['habilitacion_vehiculo'],
                        'sector_servicio' => $row['sector_servicio'] ?? '',
                        'tipo_proveedor' => $row['tipo_proveedor'] ?? '',
                        'subcategoria' => $row['subcategoria'] ?? '',
                        'created_at' => $row['created_at'],
                        'updated_at' => $row['updated_at']
                    ];
                }
                
                // Obtener opciones de filtros desde la BD
                $rubros_stmt = $db->query("SELECT DISTINCT rubro FROM " . $proveedor->table_name . " WHERE activo = 1 AND rubro != '' ORDER BY rubro");
                $rubros = $rubros_stmt->fetchAll(PDO::FETCH_COLUMN);
                
                $localidades_stmt = $db->query("SELECT DISTINCT localidad FROM " . $proveedor->table_name . " WHERE activo = 1 AND localidad != '' ORDER BY localidad");
                $localidades = $localidades_stmt->fetchAll(PDO::FETCH_COLUMN);
                
                sendResponse(true, 'Proveedores obtenidos exitosamente', [
                    'proveedores' => $proveedores_formateados,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $limit,
                        'total' => $total,
                        'total_pages' => $total_pages
                    ],
                    'filters' => [
                        'rubros' => array_merge(['Todos los rubros'], $rubros),
                        'localidades' => array_merge(['Todas las localidades'], $localidades),
                        'estados' => ['Todos los estados', 'Activo', 'Inactivo'],
                        'sectores_servicio' => ['Todos los sectores']
                    ]
                ]);
            }
            break;
            
        case 'POST':
            // Crear nuevo proveedor
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->razon_social) && !empty($data->cuit)) {
                $proveedor->codigo = $data->codigo ?? 'PROV-' . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);
                $proveedor->razon_social = $data->razon_social;
                $proveedor->cuit = $data->cuit;
                $proveedor->rubro = $data->rubro ?? '';
                $proveedor->direccion = $data->direccion ?? '';
                $proveedor->localidad = $data->localidad ?? '';
                $proveedor->provincia = $data->provincia ?? '';
                $proveedor->telefono = $data->telefono ?? '';
                $proveedor->email = $data->email ?? '';
                $proveedor->contacto_nombre = $data->contacto_nombre ?? '';
                $proveedor->contacto_cargo = $data->contacto_cargo ?? '';
                $proveedor->estado = $data->estado ?? 'Activo';
                $proveedor->seguro_RT = $data->seguro_RT ?? false;
                $proveedor->habilitacion_personal = $data->habilitacion_personal ?? '';
                $proveedor->habilitacion_vehiculo = $data->habilitacion_vehiculo ?? '';
                
                // Campos personalizados
                $campos_personalizados = [
                    'sector_servicio' => $data->sector_servicio ?? '',
                    'tipo_proveedor' => $data->tipo_proveedor ?? '',
                    'subcategoria' => $data->subcategoria ?? '',
                    'personal_contratado' => $data->personal_contratado ?? [],
                    'vencimiento_documentacion' => $data->vencimiento_documentacion ?? null
                ];
                $proveedor->campos_personalizados = $campos_personalizados;
                
                if ($proveedor->crear()) {
                    sendResponse(true, 'Proveedor creado exitosamente', ['id' => $proveedor->id], 201);
                } else {
                    sendResponse(false, 'Error al crear el proveedor', null, 500);
                }
            } else {
                sendResponse(false, 'Razón social y CUIT son obligatorios', null, 400);
            }
            break;
            
        case 'PUT':
            // Actualizar proveedor
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $proveedor->id = $data->id;
                
                if (!$proveedor->leerUno()) {
                    sendResponse(false, 'Proveedor no encontrado', null, 404);
                }
                
                $proveedor->codigo = $data->codigo ?? $proveedor->codigo;
                $proveedor->razon_social = $data->razon_social ?? $proveedor->razon_social;
                $proveedor->cuit = $data->cuit ?? $proveedor->cuit;
                $proveedor->rubro = $data->rubro ?? $proveedor->rubro;
                $proveedor->direccion = $data->direccion ?? $proveedor->direccion;
                $proveedor->localidad = $data->localidad ?? $proveedor->localidad;
                $proveedor->provincia = $data->provincia ?? $proveedor->provincia;
                $proveedor->telefono = $data->telefono ?? $proveedor->telefono;
                $proveedor->email = $data->email ?? $proveedor->email;
                $proveedor->contacto_nombre = $data->contacto_nombre ?? $proveedor->contacto_nombre;
                $proveedor->contacto_cargo = $data->contacto_cargo ?? $proveedor->contacto_cargo;
                $proveedor->estado = $data->estado ?? $proveedor->estado;
                $proveedor->seguro_RT = $data->seguro_RT ?? $proveedor->seguro_RT;
                $proveedor->habilitacion_personal = $data->habilitacion_personal ?? $proveedor->habilitacion_personal;
                $proveedor->habilitacion_vehiculo = $data->habilitacion_vehiculo ?? $proveedor->habilitacion_vehiculo;
                
                // Actualizar campos personalizados
                $current_custom = $proveedor->campos_personalizados;
                $campos_personalizados = [
                    'sector_servicio' => $data->sector_servicio ?? ($current_custom['sector_servicio'] ?? ''),
                    'tipo_proveedor' => $data->tipo_proveedor ?? ($current_custom['tipo_proveedor'] ?? ''),
                    'subcategoria' => $data->subcategoria ?? ($current_custom['subcategoria'] ?? ''),
                    'personal_contratado' => $data->personal_contratado ?? ($current_custom['personal_contratado'] ?? []),
                    'vencimiento_documentacion' => $data->vencimiento_documentacion ?? ($current_custom['vencimiento_documentacion'] ?? null)
                ];
                $proveedor->campos_personalizados = $campos_personalizados;
                
                if ($proveedor->actualizar()) {
                    sendResponse(true, 'Proveedor actualizado exitosamente');
                } else {
                    sendResponse(false, 'Error al actualizar el proveedor', null, 500);
                }
            } else {
                sendResponse(false, 'ID no especificado', null, 400);
            }
            break;
            
        case 'DELETE':
            // Eliminar proveedor (eliminación lógica)
            $data = json_decode(file_get_contents("php://input"));
            
            if (!empty($data->id)) {
                $proveedor->id = $data->id;
                
                if (!$proveedor->leerUno()) {
                    sendResponse(false, 'Proveedor no encontrado', null, 404);
                }
                
                if ($proveedor->eliminar()) {
                    sendResponse(true, 'Proveedor eliminado exitosamente');
                } else {
                    sendResponse(false, 'Error al eliminar el proveedor', null, 500);
                }
            } else {
                sendResponse(false, 'ID no especificado', null, 400);
            }
            break;
            
        default:
            sendResponse(false, 'Método no permitido', null, 405);
            break;
    }
} catch (Exception $e) {
    sendResponse(false, 'Error interno: ' . $e->getMessage(), null, 500);
}
?>
