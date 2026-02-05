<?php
// BACKEND/controllers/empresasController.php
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../models/Empresa.php';
require_once '../models/Sede.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'OPTIONS') {
    http_response_code(200);
    exit();
}

switch ($method) {
    case 'GET':
        // Determinar si es empresa o sede
        if (isset($_GET['tipo']) && $_GET['tipo'] == 'sede') {
            $sede = new Sede($db);
            
            if (isset($_GET['id'])) {
                $sede->id = $_GET['id'];
                if ($sede->leerUno()) {
                    echo json_encode([
                        'success' => true,
                        'data' => $sede
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Sede no encontrada']);
                }
            } else {
                // Listar sedes con filtros
                $search = $_GET['search'] ?? '';
                $provincia = $_GET['provincia'] ?? '';
                $estado = $_GET['estado'] ?? '';
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;
                
                // Datos mock para demostración (se implementará con BD real)
                $sedes = [
                    [
                        'id' => 1,
                        'codigo' => 'SED-001',
                        'nombre' => 'Planta Caucho - Caleta Olivia',
                        'direccion' => 'Ruta Nacional 3 KM 1285',
                        'localidad' => 'Caleta Olivia',
                        'provincia' => 'Santa Cruz',
                        'telefono' => '+54 297 485-1234',
                        'email' => 'planta.caucho@copesa-ar.com',
                        'responsable' => 'Ing. Carlos Rodríguez',
                        'tipo_habilitacion' => 'Generador de Residuos Especiales',
                        'habilitacion_numero' => 'RES-2023-001',
                        'vencimiento_habilitacion' => '2024-12-31',
                        'certificaciones' => 'ISO 14001:2015',
                        'seguridad_higiene' => 'Plan de Seguridad V001',
                        'procesos_quimicos' => 'Tratamiento de neumáticos usados',
                        'vencimiento_procesos' => '2024-06-30',
                        'base_madre_copesa' => 'Sí',
                        'estado' => 'Activa',
                        'vehiculos_asignados' => 8,
                        'permisos_por_vencer' => 1
                    ],
                    [
                        'id' => 2,
                        'codigo' => 'SED-002',
                        'nombre' => 'Planta Incineración - Puerto Madryn',
                        'direccion' => 'Zona Industrial Sur, Lote 45',
                        'localidad' => 'Puerto Madryn',
                        'provincia' => 'Chubut',
                        'telefono' => '+54 280 445-5678',
                        'email' => 'incineracion@copesa-ar.com',
                        'responsable' => 'Ing. Ana López',
                        'tipo_habilitacion' => 'Operador de Plantas de Incineración',
                        'habilitacion_numero' => 'INC-2023-002',
                        'vencimiento_habilitacion' => '2024-09-15',
                        'certificaciones' => 'ISO 9001:2015, OHSAS 18001',
                        'seguridad_higiene' => 'Protocolo de Incineración V002',
                        'procesos_quimicos' => 'Incineración de residuos patogénicos',
                        'vencimiento_procesos' => '2024-08-20',
                        'base_madre_copesa' => 'Sí',
                        'estado' => 'Activa',
                        'vehiculos_asignados' => 12,
                        'permisos_por_vencer' => 2
                    ]
                ];
                
                echo json_encode([
                    'success' => true,
                    'data' => $sedes,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $limit,
                        'total' => count($sedes),
                        'total_pages' => 1
                    ]
                ]);
            }
        } else {
            // Manejar empresas
            $empresa = new Empresa($db);
            
            if (isset($_GET['id'])) {
                $empresa->id = $_GET['id'];
                if ($empresa->leerUno()) {
                    echo json_encode([
                        'success' => true,
                        'data' => $empresa
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Empresa no encontrada']);
                }
            } else {
                // Listar empresas
                $stmt = $empresa->leer();
                $empresas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $empresas
                ]);
            }
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->tipo) && $data->tipo == 'sede') {
            // Crear nueva sede
            if (!empty($data->nombre) && !empty($data->codigo)) {
                $sede = new Sede($db);
                $sede->codigo = $data->codigo;
                $sede->nombre = $data->nombre;
                $sede->direccion = $data->direccion ?? '';
                $sede->localidad = $data->localidad ?? '';
                $sede->provincia = $data->provincia ?? '';
                $sede->telefono = $data->telefono ?? '';
                $sede->email = $data->email ?? '';
                $sede->responsable = $data->responsable ?? '';
                $sede->tipo_habilitacion = $data->tipo_habilitacion ?? '';
                $sede->habilitacion_numero = $data->habilitacion_numero ?? '';
                $sede->vencimiento_habilitacion = $data->vencimiento_habilitacion ?? null;
                $sede->certificaciones = $data->certificaciones ?? '';
                $sede->seguridad_higiene = $data->seguridad_higiene ?? '';
                $sede->procesos_quimicos = $data->procesos_quimicos ?? '';
                $sede->vencimiento_procesos = $data->vencimiento_procesos ?? null;
                $sede->base_madre_copesa = $data->base_madre_copesa ?? 'No';
                $sede->estado = $data->estado ?? 'Activa';
                
                // Aquí se implementaría $sede->crear() cuando el modelo esté completo
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Sede creada exitosamente',
                    'id' => rand(1000, 9999) // Mock ID
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Nombre y código son obligatorios']);
            }
        } else {
            // Crear empresa
            if (!empty($data->nombre)) {
                $empresa = new Empresa($db);
                $empresa->nombre = $data->nombre;
                $empresa->ruc = $data->ruc ?? '';
                $empresa->direccion = $data->direccion ?? '';
                $empresa->telefono = $data->telefono ?? '';
                $empresa->email = $data->email ?? '';
                $empresa->tipo_habilitacion = $data->tipo_habilitacion ?? '';
                $empresa->certificados = $data->certificados ?? '';
                $empresa->activo = 1;
                
                if ($empresa->crear()) {
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Empresa creada exitosamente'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Error al crear la empresa']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Nombre es obligatorio']);
            }
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->tipo) && $data->tipo == 'sede') {
            // Actualizar sede
            if (!empty($data->id)) {
                // Implementar lógica de actualización de sede
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Sede actualizada exitosamente'
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID no especificado']);
            }
        } else {
            // Actualizar empresa
            if (!empty($data->id)) {
                $empresa = new Empresa($db);
                $empresa->id = $data->id;
                
                if ($empresa->leerUno()) {
                    $empresa->nombre = $data->nombre ?? $empresa->nombre;
                    $empresa->ruc = $data->ruc ?? $empresa->ruc;
                    $empresa->direccion = $data->direccion ?? $empresa->direccion;
                    $empresa->telefono = $data->telefono ?? $empresa->telefono;
                    $empresa->email = $data->email ?? $empresa->email;
                    $empresa->tipo_habilitacion = $data->tipo_habilitacion ?? $empresa->tipo_habilitacion;
                    $empresa->certificados = $data->certificados ?? $empresa->certificados;
                    $empresa->activo = $data->activo ?? $empresa->activo;
                    
                    if ($empresa->actualizar()) {
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Empresa actualizada exitosamente'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => 'Error al actualizar la empresa']);
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Empresa no encontrada']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID no especificado']);
            }
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->tipo) && $data->tipo == 'sede') {
            // Eliminar sede (lógica)
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Sede eliminada exitosamente'
            ]);
        } else {
            // Eliminar empresa
            if (!empty($data->id)) {
                $empresa = new Empresa($db);
                $empresa->id = $data->id;
                
                if ($empresa->leerUno()) {
                    $empresa->activo = 0;
                    
                    if ($empresa->actualizar()) {
                        http_response_code(200);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Empresa eliminada exitosamente'
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => 'Error al eliminar la empresa']);
                    }
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Empresa no encontrada']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID no especificado']);
            }
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        break;
}
?>