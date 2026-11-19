<?php

use App\Controllers\SprintsController;
use Slim\App;

return function (App $app) {
    $controller = new SprintsController();

    $app->get('/sprints', [$controller, 'index']);
    $app->get('/sprints/{id}', [$controller, 'show']);
    $app->post('/sprints', [$controller, 'store']);
    $app->put('/sprints/{id}', [$controller, 'update']);
    $app->delete('/sprints/{id}', [$controller, 'destroy']);
};