<?php
// BACKEND/controllers/proveedoresController.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Leer un proveedor específico
            $proveedor->id = $_GET['id'];
            if ($proveedor->leerUno()) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => [
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
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Proveedor no encontrado']);
            }
        } else {
            // Listar con filtros y paginación
            $search = $_GET['search'] ?? '';
            $rubro = $_GET['rubro'] ?? '';
            $estado = $_GET['estado'] ?? '';
            $localidad = $_GET['localidad'] ?? '';
            $sector_servicio = $_GET['sector_servicio'] ?? '';
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Datos mock para demostración con todos los nuevos campos
            $proveedores_mock = [
                [
                    'id' => 1,
                    'codigo' => 'PROV-001',
                    'razon_social' => 'Seguridad Integral S.A.',
                    'cuit' => '30-12345678-9',
                    'rubro' => 'Servicios de Seguridad',
                    'direccion' => 'Av. Libertador 1234',
                    'localidad' => 'Capital Federal',
                    'provincia' => 'Buenos Aires',
                    'telefono' => '011-4789-1234',
                    'email' => 'contacto@seguridadintegral.com',
                    'contacto_nombre' => 'Juan Pérez',
                    'contacto_cargo' => 'Gerente de Operaciones',
                    'estado' => 'Activo',
                    'seguro_RT' => true,
                    'habilitacion_personal' => 'HAB-PERS-2023-001',
                    'habilitacion_vehiculo' => 'HAB-VEH-2023-001',
                    'sector_servicio' => 'Vigilancia de Instalaciones',
                    'tipo_proveedor' => 'Razón Social',
                    'subcategoria' => 'Servicio de Vigilancia',
                    'personal_contratado' => [
                        ['nombre' => 'Carlos Gómez', 'dni' => '30123456', 'capacitaciones' => 'Curso de Vigilancia Nivel II'],
                        ['nombre' => 'María Rodríguez', 'dni' => '28987654', 'capacitaciones' => 'Primeros Auxilios, Manejo Defensivo']
                    ],
                    'vencimiento_documentacion' => '2024-06-30',
                    'contratos_vigentes' => 3,
                    'contratos_por_renovar' => 1
                ],
                [
                    'id' => 2,
                    'codigo' => 'PROV-002',
                    'razon_social' => 'Transportes Rápido S.R.L.',
                    'cuit' => '30-98765432-1',
                    'rubro' => 'Transporte',
                    'direccion' => 'Ruta 8 KM 45',
                    'localidad' => 'Pilar',
                    'provincia' => 'Buenos Aires',
                    'telefono' => '011-4123-4567',
                    'email' => 'info@transportesrapido.com',
                    'contacto_nombre' => 'Ana López',
                    'contacto_cargo' => 'Directora Comercial',
                    'estado' => 'Activo',
                    'seguro_RT' => true,
                    'habilitacion_personal' => 'HAB-PERS-2023-002',
                    'habilitacion_vehiculo' => 'HAB-VEH-2023-005',
                    'sector_servicio' => 'Transporte de Carga',
                    'tipo_proveedor' => 'Sociedad de Responsabilidad Limitada',
                    'subcategoria' => 'Transporte Terrestre',
                    'personal_contratado' => [
                        ['nombre' => 'Roberto Sánchez', 'dni' => '32123456', 'capacitaciones' => 'Manejo de Cargas Peligrosas']
                    ],
                    'vencimiento_documentacion' => '2024-08-15',
                    'contratos_vigentes' => 2,
                    'contratos_por_renovar' => 0
                ]
            ];
            
            // Aplicar filtros
            $filtered = array_filter($proveedores_mock, function($prov) use ($search, $rubro, $estado, $localidad, $sector_servicio) {
                $match = true;
                
                if ($search && stripos($prov['razon_social'], $search) === false && 
                    stripos($prov['cuit'], $search) === false &&
                    stripos($prov['contacto_nombre'], $search) === false) {
                    $match = false;
                }
                
                if ($rubro && $rubro !== 'Todos los rubros' && $prov['rubro'] !== $rubro) {
                    $match = false;
                }
                
                if ($estado && $estado !== 'Todos los estados' && $prov['estado'] !== $estado) {
                    $match = false;
                }
                
                if ($localidad && $localidad !== 'Todas las localidades' && $prov['localidad'] !== $localidad) {
                    $match = false;
                }
                
                if ($sector_servicio && $prov['sector_servicio'] !== $sector_servicio) {
                    $match = false;
                }
                
                return $match;
            });
            
            $total = count($filtered);
            $total_pages = ceil($total / $limit);
            $paginated = array_slice($filtered, $offset, $limit);
            
            // Obtener opciones de filtros
            $rubros = array_unique(array_column($proveedores_mock, 'rubro'));
            $localidades = array_unique(array_column($proveedores_mock, 'localidad'));
            $estados = array_unique(array_column($proveedores_mock, 'estado'));
            $sectores_servicio = array_unique(array_column($proveedores_mock, 'sector_servicio'));
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $paginated,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => $total_pages
                ],
                'filters' => [
                    'rubros' => array_merge(['Todos los rubros'], $rubros),
                    'localidades' => array_merge(['Todas las localidades'], $localidades),
                    'estados' => array_merge(['Todos los estados'], $estados),
                    'sectores_servicio' => array_merge(['Todos los sectores'], $sectores_servicio)
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
            
            try {
                if ($proveedor->crear()) {
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Proveedor creado exitosamente',
                        'id' => $proveedor->id
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al crear el proveedor']);
                }
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Razón social y CUIT son obligatorios']);
        }
        break;
        
    case 'PUT':
        // Actualizar proveedor
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $proveedor->id = $data->id;
            
            try {
                if ($proveedor->leerUno()) {
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
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Proveedor actualizado exitosamente'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => 'Error al actualizar el proveedor']);
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Proveedor no encontrado']);
                }
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID no especificado']);
        }
        break;
        
    case 'DELETE':
        // Eliminar proveedor (eliminación lógica)
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $proveedor->id = $data->id;
            
            if ($proveedor->leerUno()) {
                if ($proveedor->eliminar()) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Proveedor eliminado exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al eliminar el proveedor']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Proveedor no encontrado']);
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