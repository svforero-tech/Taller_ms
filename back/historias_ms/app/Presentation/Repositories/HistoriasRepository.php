<?php

namespace App\Presentation\Repositories;

use App\Models\Historia;
use App\Models\Sprint;

class HistoriasRepository
{
    public function getAll(array $filters = [])
    {
        $query = Historia::with('sprint')->orderBy('id', 'desc');

        if (!empty($filters['sprint_id'])) {
            $query->where('sprint_id', $filters['sprint_id']);
        }

        if (!empty($filters['estado'])) {
            $query->where('estado', $filters['estado']);
        }

        return $query->get();
    }

    public function getById($id)
    {
        return Historia::with('sprint')->find($id);
    }

    public function getGroupedBySprint()
    {
        return Sprint::with(['historias' => function ($q) {
            $q->orderBy('id', 'desc');
        }])->orderBy('id', 'desc')->get();
    }

    public function create(array $data)
    {
        return Historia::create([
            'titulo'             => $data['titulo'],
            'descripcion'        => $data['descripcion'],
            'responsable'        => $data['responsable'],
            'estado'             => $data['estado'] ?? 'nueva',
            'puntos'             => (int) $data['puntos'],
            'fecha_creacion'     => $data['fecha_creacion'] ?? date('Y-m-d'),
            'fecha_finalizacion' => $data['fecha_finalizacion'] ?? null,
            'sprint_id'          => (int) $data['sprint_id'],
        ]);
    }

    public function update($id, array $data)
    {
        $historia = Historia::find($id);
        if (!$historia) {
            return null;
        }

        $estado = $data['estado'] ?? $historia->estado;
        $fechaFinalizacion = array_key_exists('fecha_finalizacion', $data)
            ? $data['fecha_finalizacion']
            : $historia->fecha_finalizacion;

        if ($estado === 'finalizada' && empty($fechaFinalizacion)) {
            $fechaFinalizacion = date('Y-m-d');
        }

        $historia->update([
            'titulo'             => $data['titulo'] ?? $historia->titulo,
            'descripcion'        => $data['descripcion'] ?? $historia->descripcion,
            'responsable'        => $data['responsable'] ?? $historia->responsable,
            'estado'             => $estado,
            'puntos'             => isset($data['puntos']) ? (int) $data['puntos'] : $historia->puntos,
            'fecha_creacion'     => $data['fecha_creacion'] ?? $historia->fecha_creacion,
            'fecha_finalizacion' => $fechaFinalizacion,
            'sprint_id'          => isset($data['sprint_id']) ? (int) $data['sprint_id'] : $historia->sprint_id,
        ]);

        return $historia->fresh('sprint');
    }

    public function delete($id)
    {
        $historia = Historia::find($id);
        if (!$historia) {
            return false;
        }

        return $historia->delete();
    }

    public function getInforme($sprintId = null)
    {
        $query = Historia::query();
        if (!empty($sprintId)) {
            $query->where('sprint_id', $sprintId);
        }

        $historias = $query->get();
        $estados = ['nueva', 'activa', 'finalizada', 'impedimento'];

        $general = [
            'total_historias' => $historias->count(),
            'total_puntos'    => (int) $historias->sum('puntos'),
            'por_estado'      => [],
        ];

        foreach ($estados as $estado) {
            $filtradas = $historias->where('estado', $estado);
            $general['por_estado'][$estado] = [
                'cantidad' => $filtradas->count(),
                'puntos'   => (int) $filtradas->sum('puntos'),
            ];
        }

        $porResponsable = [];
        foreach ($historias->groupBy('responsable') as $responsable => $items) {
            $fila = [
                'responsable'     => $responsable,
                'total_historias' => $items->count(),
                'total_puntos'    => (int) $items->sum('puntos'),
                'por_estado'      => [],
            ];

            foreach ($estados as $estado) {
                $filtradas = $items->where('estado', $estado);
                $fila['por_estado'][$estado] = [
                    'cantidad' => $filtradas->count(),
                    'puntos'   => (int) $filtradas->sum('puntos'),
                ];
            }

            $porResponsable[] = $fila;
        }

        return [
            'sprint_id'       => $sprintId ? (int) $sprintId : null,
            'general'         => $general,
            'por_responsable' => $porResponsable,
        ];
    }
}