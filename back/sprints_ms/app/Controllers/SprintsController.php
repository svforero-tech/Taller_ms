<?php

namespace App\Controllers;

use App\Presentation\Repositories\SprintsRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SprintsController
{
    private SprintsRepository $repository;

    public function __construct()
    {
        $this->repository = new SprintsRepository();
    }

    private function jsonResponse(Response $response, $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/json');
    }

    public function index(Request $request, Response $response): Response
    {
        $sprints = $this->repository->getAll();
        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $sprints
        ], 200);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $sprint = $this->repository->getById($args['id']);
        if (!$sprint) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Sprint no encontrado'
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $sprint
        ], 200);
    }

    public function store(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        if (empty($data['nombre']) || empty($data['fecha_inicio']) || empty($data['fecha_fin'])) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Los campos nombre, fecha_inicio y fecha_fin son obligatorios',
            ], 400);
        }

        if ($data['fecha_fin'] < $data['fecha_inicio']) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'La fecha_fin no puede ser menor que fecha_inicio'
            ], 400);
        }

        $sprint = $this->repository->create($data);

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Sprint creado correctamente',
            'data'    => $sprint
        ], 201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $data = $request->getParsedBody() ?? [];
        $sprint = $this->repository->update($args['id'], $data);

        if (!$sprint) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Sprint no encontrado'
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Sprint actualizado correctamente',
            'data'    => $sprint
        ], 200);
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $deleted = $this->repository->delete($args['id']);

        if (!$deleted) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Sprint no encontrado'
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Sprint eliminado correctamente'
        ], 200);
    }
}
