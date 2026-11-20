<?php

namespace App\Presentation\Repositories;

use App\Models\Sprint;

class SprintsRepository
{
    
    public function getAll()
    {
        return Sprint::with('historias')->orderBy('id', 'desc')->get();
    }

    public function getById($id)
    {
        return Sprint::with('historias')->find($id);
    }

    public function create(array $data)
    {
        return Sprint::create([
            'nombre'       => $data['nombre'],
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin'    => $data['fecha_fin'],
        ]);
    }

    public function update($id, array $data)
    {
        $sprint = Sprint::find($id);
        if (!$sprint) {
            return null;
        }

        $sprint->update([
            'nombre'       => $data['nombre'] ?? $sprint->nombre,
            'fecha_inicio' => $data['fecha_inicio'] ?? $sprint->fecha_inicio,
            'fecha_fin'    => $data['fecha_fin'] ?? $sprint->fecha_fin,
        ]);

        return $sprint;
    }

    public function delete($id)
    {
        $sprint = Sprint::find($id);
        if (!$sprint) {
            return false;
        }

        return $sprint->delete();
    }
}