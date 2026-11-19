<?php

namespace App\Controllers;

use App\Models\Sprint;
use App\Presentation\Repositories\HistoriasRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class HistoriasController
{
    private HistoriasRepository $repository;
    private array $estadosValidos = ['nueva', 'activa', 'finalizada', 'impedimento'];

    public function __construct()
    {
        $this->repository = new HistoriasRepository();
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
        $params = $request->getQueryParams();
        $historias = $this->repository->getAll($params);

        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $historias,
        ], 200);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $historia = $this->repository->getById($args['id']);
        if (!$historia) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Historia de usuario no encontrada',
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $historia,
        ], 200);
    }

    public function porSprint(Request $request, Response $response): Response
    {
        $grupos = $this->repository->getGroupedBySprint();

        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $grupos,
        ], 200);
    }

    public function store(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];

        if (
            empty($data['titulo']) ||
            empty($data['descripcion']) ||
            empty($data['responsable']) ||
            !isset($data['puntos']) ||
            empty($data['sprint_id'])
        ) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Los campos titulo, descripcion, responsable, puntos y sprint_id son obligatorios',
            ], 400);
        }

        $estado = $data['estado'] ?? 'nueva';
        if (!in_array($estado, $this->estadosValidos, true)) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Estado no valido. Use: nueva, activa, finalizada o impedimento',
            ], 400);
        }

        if (!Sprint::find($data['sprint_id'])) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'El sprint_id indicado no existe',
            ], 400);
        }

        $data['estado'] = $estado;
        $historia = $this->repository->create($data);

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Historia creada correctamente',
            'data'    => $this->repository->getById($historia->id),
        ], 201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $data = $request->getParsedBody() ?? [];

        if (isset($data['estado']) && !in_array($data['estado'], $this->estadosValidos, true)) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Estado no valido. Use: nueva, activa, finalizada o impedimento',
            ], 400);
        }

        if (!empty($data['sprint_id']) && !Sprint::find($data['sprint_id'])) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'El sprint_id indicado no existe',
            ], 400);
        }

        $historia = $this->repository->update($args['id'], $data);
        if (!$historia) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Historia de usuario no encontrada',
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Historia actualizada correctamente',
            'data'    => $historia,
        ], 200);
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $deleted = $this->repository->delete($args['id']);
        if (!$deleted) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'Historia de usuario no encontrada',
            ], 404);
        }

        return $this->jsonResponse($response, [
            'status'  => 'success',
            'message' => 'Historia eliminada correctamente',
        ], 200);
    }

    public function informe(Request $request, Response $response): Response
    {
        $params = $request->getQueryParams();
        $sprintId = $params['sprint_id'] ?? null;

        if (!empty($sprintId) && !Sprint::find($sprintId)) {
            return $this->jsonResponse($response, [
                'status'  => 'error',
                'message' => 'El sprint_id indicado no existe',
            ], 404);
        }

        $informe = $this->repository->getInforme($sprintId);

        return $this->jsonResponse($response, [
            'status' => 'success',
            'data'   => $informe,
        ], 200);
    }
}