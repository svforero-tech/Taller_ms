import { SprintsService, HistoriasService } from '../app_historias/js/services/historias_services.js';

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderSprintsInicio(sprints = []) {
    const contenedor = document.getElementById('introSprints');
    if (!contenedor) return;

    if (!Array.isArray(sprints) || sprints.length === 0) {
        contenedor.innerHTML = `<div class="empty-state">No hay sprints registrados todavia.</div>`;
        return;
    }

    contenedor.innerHTML = sprints.map(sp => {
        const textoFin = sp.fecha_fin ? sp.fecha_fin : 'En curso (sin finalizar)';
        return `
            <article class="intro-item-card">
                <h4>${escapeHtml(sp.nombre)}</h4>
                <small class="meta-info">
                    Inicio: <strong>${escapeHtml(sp.fecha_inicio)}</strong> |
                    Fin: <strong>${escapeHtml(textoFin)}</strong>
                </small>
            </article>
        `;
    }).join('');
}

function renderHistoriasInicio(historias = [], sprints = []) {
    const contenedor = document.getElementById('introHistorias');
    if (!contenedor) return;

    if (!Array.isArray(historias) || historias.length === 0) {
        contenedor.innerHTML = `<div class="empty-state">No hay historias de usuario registradas.</div>`;
        return;
    }

    const mapaSprints = new Map(sprints.map(sp => [Number(sp.id), sp.nombre]));

    contenedor.innerHTML = historias.map(h => {
        const nombreSprint = (h.sprint && h.sprint.nombre)
            ? h.sprint.nombre
            : (mapaSprints.get(Number(h.sprint_id)) || `Sprint #${h.sprint_id}`);

        return `
            <article class="intro-item-card intro-item-historia">
                <div class="intro-item-top">
                    <h4>${escapeHtml(h.titulo)}</h4>
                    <span class="intro-badge">${escapeHtml(h.estado)}</span>
                </div>
                <small class="meta-info">
                    Sprint: <strong>${escapeHtml(nombreSprint)}</strong> |
                    Responsable: <strong>${escapeHtml(h.responsable)}</strong> |
                    Puntos: <strong>${escapeHtml(h.puntos)}</strong>
                </small>
                <p class="intro-item-desc">${escapeHtml(h.descripcion)}</p>
            </article>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [resSprints, resHistorias] = await Promise.all([
            SprintsService.getAll(),
            HistoriasService.getAll()
        ]);

        const sprints = Array.isArray(resSprints.data) ? resSprints.data : [];
        const historias = Array.isArray(resHistorias.data) ? resHistorias.data : [];

        renderSprintsInicio(sprints);
        renderHistoriasInicio(historias, sprints);
    } catch (err) {
        const sprintsEl = document.getElementById('introSprints');
        const historiasEl = document.getElementById('introHistorias');
        if (sprintsEl) sprintsEl.innerHTML = `<div class="empty-state">No se pudieron cargar los sprints.</div>`;
        if (historiasEl) historiasEl.innerHTML = `<div class="empty-state">No se pudieron cargar las historias.</div>`;
    }
});