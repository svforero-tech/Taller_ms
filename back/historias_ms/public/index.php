<?php

use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/Base/database.php';

$app = AppFactory::create();

// Permite leer cuerpos JSON en peticiones POST / PUT
$app->addBodyParsingMiddleware();

// Middleware CORS
$cors = require __DIR__ . '/../app/Base/cors.php';
$cors($app);

// Rutas del microservicio de historias
$routes = require __DIR__ . '/../app/Presentation/Routers/endpoints.php';
$routes($app);

$app->addErrorMiddleware(true, true, true);

$app->run();