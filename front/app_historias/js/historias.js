import { SprintsService, HistoriasService } from './services/historias_services.js';
import {
    renderHistoriasLista,
    renderHistoriasPorSprint
} from './components/historias_components.js';

const state = {
    sprints: [],
    historias: [],
    vistaActual: 'lista'
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

function poblarSelectsSprints() {
    const selects = [
        document.getElementById('historiaSprint'),
        document.getElementById('filtroSprint'),
        document.getElementById('editSprint')
    ];

    selects.forEach((select, idx) => {
        if (!select) return;
        const valorPrevio = select.value;

        if (idx === 0 || idx === 2) {
            select.innerHTML = `<option value="">Seleccione un sprint...</option>`;
        } else {
            select.innerHTML = `<option value="">Todos los sprints</option>`;
        }

        state.sprints.forEach(sp => {
            const opt = document.createElement('option');
            opt.value = sp.id;
            opt.textContent = sp.nombre;
            select.appendChild(opt);
        });

        if (valorPrevio) {
            select.value = valorPrevio;
        }
    });
}

async function cargarSprints() {
    const res = await SprintsService.getAll();
    state.sprints = Array.isArray(res.data) ? res.data : [];
    poblarSelectsSprints();
    renderListaSprints();
}

async function cargarHistorias() {
    const sprintId = document.getElementById('filtroSprint')?.value || '';
    const estado = document.getElementById('filtroEstado')?.value || '';
    const contenedor = document.getElementById('contenedorHistorias');
    if (!contenedor) return;

    if (state.vistaActual === 'por-sprint') {
        const res = await HistoriasService.getGroupedBySprint();
        contenedor.innerHTML = renderHistoriasPorSprint(res.data || []);
    } else {
        const res = await HistoriasService.getAll({ sprint_id: sprintId, estado });
        state.historias = Array.isArray(res.data) ? res.data : [];
        contenedor.innerHTML = renderHistoriasLista(state.historias);
    }
}

async function refrescarTodo() {
    await cargarSprints();
    await cargarHistorias();
}

function abrirModalEdicion(historia) {
    const modal = document.getElementById('modalEditar');
    if (!modal || !historia) return;

    document.getElementById('editId').value = historia.id;
    document.getElementById('editTitulo').value = historia.titulo || '';
    document.getElementById('editDescripcion').value = historia.descripcion || '';
    document.getElementById('editResponsable').value = historia.responsable || '';
    document.getElementById('editEstado').value = historia.estado || 'nueva';
    document.getElementById('editPuntos').value = historia.puntos ?? 1;
    document.getElementById('editSprint').value = historia.sprint_id || '';
    document.getElementById('editFechaFinalizacion').value = historia.fecha_finalizacion || '';

    modal.classList.add('active');
}

function cerrarModalEdicion() {
    const modal = document.getElementById('modalEditar');
    if (modal) {
        modal.classList.remove('active');
    }
}

function registrarEventos() {
    const formSprint = document.getElementById('formSprint');
    formSprint?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('sprintNombre').value.trim(),
            fecha_inicio: document.getElementById('sprintInicio').value,
            fecha_fin: document.getElementById('sprintFin').value || null
        };

        try {
            await SprintsService.create(data);
            formSprint.reset();
            showToast('Sprint creado correctamente', 'success');
            await refrescarTodo();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    const formHistoria = document.getElementById('formHistoria');
    formHistoria?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            titulo: document.getElementById('historiaTitulo').value.trim(),
            descripcion: document.getElementById('historiaDescripcion').value.trim(),
            responsable: document.getElementById('historiaResponsable').value.trim(),
            estado: document.getElementById('historiaEstado').value,
            puntos: Number(document.getElementById('historiaPuntos').value),
            sprint_id: Number(document.getElementById('historiaSprint').value)
        };

        try {
            await HistoriasService.create(data);
            formHistoria.reset();
            showToast('Historia de usuario creada', 'success');
            await cargarHistorias();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('filtroSprint')?.addEventListener('change', cargarHistorias);
    document.getElementById('filtroEstado')?.addEventListener('change', cargarHistorias);
    document.getElementById('btnLimpiarFiltros')?.addEventListener('click', async () => {
        document.getElementById('filtroSprint').value = '';
        document.getElementById('filtroEstado').value = '';
        await cargarHistorias();
    });

    document.getElementById('btnVistaLista')?.addEventListener('click', async () => {
        state.vistaActual = 'lista';
        await cargarHistorias();
    });

    document.getElementById('btnVistaSprint')?.addEventListener('click', async () => {
        state.vistaActual = 'por-sprint';
        await cargarHistorias();
    });

    document.getElementById('contenedorHistorias')?.addEventListener('click', async (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        if (btnEditar) {
            const id = Number(btnEditar.dataset.id);
            let historia = state.historias.find(h => Number(h.id) === id);
            if (!historia) {
                const res = await HistoriasService.getAll();
                state.historias = Array.isArray(res.data) ? res.data : [];
                historia = state.historias.find(h => Number(h.id) === id);
            }
            abrirModalEdicion(historia);
            return;
        }

        const btnEliminar = e.target.closest('.btn-eliminar');
        if (btnEliminar) {
            const id = Number(btnEliminar.dataset.id);
            if (!confirm('¿Seguro que deseas eliminar esta historia?')) return;

            try {
                await HistoriasService.delete(id);
                showToast('Historia eliminada', 'success');
                await cargarHistorias();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }
    });

    document.getElementById('cerrarModal')?.addEventListener('click', cerrarModalEdicion);
    document.getElementById('cancelarModal')?.addEventListener('click', cerrarModalEdicion);

    document.getElementById('formEditarHistoria')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('editId').value);
        const fechaFin = document.getElementById('editFechaFinalizacion').value;

        const data = {
            titulo: document.getElementById('editTitulo').value.trim(),
            descripcion: document.getElementById('editDescripcion').value.trim(),
            responsable: document.getElementById('editResponsable').value.trim(),
            estado: document.getElementById('editEstado').value,
            puntos: Number(document.getElementById('editPuntos').value),
            sprint_id: Number(document.getElementById('editSprint').value),
            fecha_finalizacion: fechaFin || null
        };

        try {
            await HistoriasService.update(id, data);
            cerrarModalEdicion();
            showToast('Historia actualizada', 'success');
            await cargarHistorias();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    registrarEventos();
    try {
        await refrescarTodo();
    } catch (err) {
        showToast(`Error conectando con los microservicios: ${err.message}`, 'error');
    }
});

function renderListaSprints() {
    const contenedor = document.getElementById('contenedorSprints');
    if (!contenedor) return;

    if (state.sprints.length === 0) {
        contenedor.innerHTML = `<div class="empty-state">No hay sprints registrados todavia.</div>`;
        return;
    }

    contenedor.innerHTML = state.sprints.map(sp => `
        <article class="historia-card">
            <div class="historia-header">
                <div>
                    <h4>${sp.nombre}</h4>
                    <small class="meta-info">Inicio: <strong>${sp.fecha_inicio}</strong> | Fin: <strong>${sp.fecha_fin}</strong></small>
                </div>
            </div>
        </article>
    `).join('');
}

function activarTransicionNavegacion() {
    document.addEventListener('click', (event) => {
        const enlace = event.target.closest('a[href]');
        if (!enlace) return;

        const href = enlace.getAttribute('href');
        if (
            !href ||
            href.startsWith('#') ||
            enlace.target === '_blank' ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();
        document.body.classList.add('pagina-saliendo');
        setTimeout(() => {
            window.location.href = enlace.href;
        }, 140);
    });
}