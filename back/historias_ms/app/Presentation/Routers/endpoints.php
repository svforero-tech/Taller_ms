<?php

use App\Controllers\HistoriasController;
use Slim\App;

return function (App $app) {
    $controller = new HistoriasController();

    $app->get('/historias', [$controller, 'index']);
    $app->get('/historias/por-sprint', [$controller, 'porSprint']);
    $app->get('/historias/{id}', [$controller, 'show']);
    $app->post('/historias', [$controller, 'store']);
    $app->put('/historias/{id}', [$controller, 'update']);
    $app->delete('/historias/{id}', [$controller, 'destroy']);

    $app->get('/informes', [$controller, 'informe']);
};