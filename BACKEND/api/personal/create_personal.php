<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../models/Personal.php';

$database = new Database();
$db = $database->getConnection();
$personal = new Personal($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre) && !empty($data->apellido) && !empty($data->dni)) {
    $personal->nombre = $data->nombre;
    $personal->apellido = $data->apellido;
    $personal->dni = $data->dni;
    $personal->telefono = $data->telefono ?? '';
    $personal->email = $data->email ?? '';
    $personal->puesto = $data->cargo ?? '';
    $personal->sector = $data->sector ?? '';
    $personal->fecha_ingreso = $data->fecha_ingreso ?? date('Y-m-d');
    $personal->activo = 1; // Siempre activo al crear

    if ($personal->crear()) {
        http_response_code(201);
        echo json_encode(array(
            "message" => "Personal creado exitosamente",
            "id" => $personal->id
        ));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "No se pudo crear el personal. El DNI ya existe."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos. Nombre, apellido y DNI son requeridos."));
}
?>