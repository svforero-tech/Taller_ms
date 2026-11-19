function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderEstadoBadge(estado) {
    const colores = {
        nueva: 'background:#e0f2fe;color:#0369a1;',
        activa: 'background:#fef3c7;color:#b45309;',
        finalizada: 'background:#dcfce7;color:#15803d;',
        impedimento: 'background:#fee2e2;color:#b91c1c;'
    };
    const estilo = colores[estado] || 'background:#e2e8f0;color:#334155;';
    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:0.78rem;font-weight:700;${estilo}">${escapeHtml(estado)}</span>`;
}

export function renderHistoriasLista(historias = []) {
    if (!Array.isArray(historias) || historias.length === 0) {
        return `<div class="empty-state">No hay historias de usuario registradas.</div>`;
    }

    return historias.map(h => {
        const nombreSprint = h.sprint && h.sprint.nombre
            ? h.sprint.nombre
            : `Sprint #${escapeHtml(h.sprint_id)}`;

        return `
            <article class="historia-card" data-id="${h.id}">
                <div class="historia-header">
                    <div>
                        <h4>${escapeHtml(h.titulo)}</h4>
                        <small class="meta-info">
                            Sprint: <strong>${escapeHtml(nombreSprint)}</strong> |
                            Responsable: <strong>${escapeHtml(h.responsable)}</strong> |
                            Puntos: <strong>${escapeHtml(h.puntos)}</strong>
                        </small>
                    </div>
                    <div>${renderEstadoBadge(h.estado)}</div>
                </div>
                <p class="historia-desc">${escapeHtml(h.descripcion)}</p>
                <div class="historia-footer">
                    <small class="fechas-info">
                        Creada: ${escapeHtml(h.fecha_creacion || '-')}
                        ${h.fecha_finalizacion ? ` | Finalizada: ${escapeHtml(h.fecha_finalizacion)}` : ''}
                    </small>
                    <div class="card-actions">
                        <button type="button" class="btn btn-secondary btn-sm btn-editar" data-id="${h.id}">Editar</button>
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-id="${h.id}">Eliminar</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

export function renderHistoriasPorSprint(sprints = []) {
    if (!Array.isArray(sprints) || sprints.length === 0) {
        return `<div class="empty-state">No hay sprints registrados todavia.</div>`;
    }

    return sprints.map(sprint => {
        const historias = Array.isArray(sprint.historias) ? sprint.historias : [];
        const totalPuntos = historias.reduce((acc, item) => acc + (Number(item.puntos) || 0), 0);
        const fechaFinTexto = sprint.fecha_fin ? `al ${escapeHtml(sprint.fecha_fin)}` : '(En curso)';

        const itemsHtml = historias.length > 0
            ? historias.map(h => `
                <li class="sprint-historia-item">
                    <span>
                        <strong>${escapeHtml(h.titulo)}</strong> (${escapeHtml(h.responsable)} - ${escapeHtml(h.puntos)} pts)
                    </span>
                    <span class="item-right">
                        ${renderEstadoBadge(h.estado)}
                        <button type="button" class="btn btn-secondary btn-sm btn-editar" data-id="${h.id}">Editar</button>
                        <button type="button" class="btn btn-danger btn-sm btn-eliminar" data-id="${h.id}">Eliminar</button>
                    </span>
                </li>
            `).join('')
            : `<li class="sprint-vacio">Sin historias asignadas en este sprint.</li>`;

        return `
            <section class="sprint-grupo">
                <div class="sprint-grupo-header">
                    <div>
                        <h4>${escapeHtml(sprint.nombre)}</h4>
                        <small>${escapeHtml(sprint.fecha_inicio)} ${fechaFinTexto}</small>
                    </div>
                    <span class="sprint-resumen">${historias.length} historias | ${totalPuntos} pts</span>
                </div>
                <ul class="sprint-historias-list">
                    ${itemsHtml}
                </ul>
            </section>
        `;
    }).join('');
}