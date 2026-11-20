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

function renderCalendarioActual() {
    const hoy = new Date();
    const fechaTextoEl = document.getElementById('fechaActualTexto');
    const mesTituloEl = document.getElementById('calendarioMesTitulo');
    const grillaEl = document.getElementById('calendarioGrilla');

    if (!fechaTextoEl || !mesTituloEl || !grillaEl) return;

    const diasLargos = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    fechaTextoEl.textContent = `${diasLargos[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()].toLowerCase()}`;
    mesTituloEl.textContent = `${meses[hoy.getMonth()]} ${hoy.getFullYear()}`;

    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();
    const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7; // Lunes = 0
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();

    let celdas = '';
    for (let i = 0; i < primerDiaSemana; i++) {
        celdas += `<span class="dia-vacio"></span>`;
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const esHoy = dia === hoy.getDate() ? 'es-hoy' : '';
        celdas += `<span class="dia-numero ${esHoy}">${dia}</span>`;
    }

    grillaEl.innerHTML = celdas;
}

function renderSeguimientoSprints(sprints = [], historias = []) {
    const contenedor = document.getElementById('contenedorSeguimientoSprints');
    if (!contenedor) return;

    if (!Array.isArray(sprints) || sprints.length === 0) {
        contenedor.innerHTML = `<div class="empty-state">No hay sprints registrados todavía.</div>`;
        return;
    }

    contenedor.innerHTML = sprints.map(sprint => {
        const historiasSprint = historias.filter(h => Number(h.sprint_id) === Number(sprint.id));

        const tarjetasHtml = historiasSprint.length > 0
            ? historiasSprint.map(h => {
                const inicial = (h.responsable || 'U').trim().charAt(0).toUpperCase();
                return `
                    <article class="sprint-story-card">
                        <div class="story-card-top">
                            <span class="story-estado-badge">${escapeHtml(h.estado || 'Nueva')}</span>
                            <span class="story-fecha">Creada: ${escapeHtml((h.created_at || '').slice(0, 10) || '-')}</span>
                        </div>
                        <h4 class="story-card-title">${escapeHtml(h.titulo)}</h4>
                        <p class="story-card-desc">${escapeHtml(h.descripcion || '')}</p>
                        <div class="story-card-meta">
                            <span class="story-responsable">
                                <span class="story-avatar">${escapeHtml(inicial)}</span>
                                ${escapeHtml(h.responsable)}
                            </span>
                            <span class="story-puntos">${escapeHtml(h.puntos)} pts</span>
                        </div>
                        <div class="story-card-actions">
                            <a href="../app_historias/index.html" class="btn-mini-action">Ver en tablero</a>
                        </div>
                    </article>
                `;
            }).join('')
            : `<div class="sprint-sin-historias">Sin historias asignadas en este sprint.</div>`;

        return `
            <section class="sprint-bloque-card">
                <div class="sprint-bloque-header">
                    <div class="sprint-bloque-titulo">
                        <h3>${escapeHtml(sprint.nombre)}</h3>
                        <span class="sprint-rango-fechas">${escapeHtml(sprint.fecha_inicio)} — ${escapeHtml(sprint.fecha_fin)}</span>
                    </div>
                    <a href="../app_historias/nueva_historia.html?sprint_id=${encodeURIComponent(sprint.id)}" class="btn-asignar-historia">+ Asignar historia</a>
                </div>
                <div class="sprint-bloque-body">
                    ${tarjetasHtml}
                </div>
            </section>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    activarTransicionNavegacion();
    renderCalendarioActual();

    const contenedor = document.getElementById('contenedorSeguimientoSprints');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }

    try {
        const [resSprints, resHistorias] = await Promise.all([
            SprintsService.getAll(),
            HistoriasService.getAll()
        ]);

        const sprints = Array.isArray(resSprints.data) ? resSprints.data : [];
        const historias = Array.isArray(resHistorias.data) ? resHistorias.data : [];

        const elSprints = document.getElementById('miniTotalSprints');
        const elHistorias = document.getElementById('miniTotalHistorias');
        if (elSprints) elSprints.textContent = String(sprints.length);
        if (elHistorias) elHistorias.textContent = String(historias.length);

        renderSeguimientoSprints(sprints, historias);
        renderAlertasYRecordatorios(sprints, historias);
    } catch (error) {
        if (contenedor) {
            contenedor.innerHTML = `<div class="empty-state">No se pudo cargar la información de sprints e historias.</div>`;
        }
    }
});

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

function renderAlertasYRecordatorios(sprints, historias) {
    const lista = document.getElementById('listaAlertasInicio');
    if (!lista) return;

    const alertas = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const msPorDia = 1000 * 60 * 60 * 24;

    sprints.forEach((sprint) => {
        const nombreSprint = sprint.nombre || `Sprint #${sprint.id}`;
        const fechaFinStr = sprint.fecha_fin || '';
        const fechaInicioStr = sprint.fecha_inicio || '';

        if (!fechaFinStr || fechaFinStr === '0000-00-00') {
            alertas.push({
                tipo: 'alerta-peligro',
                texto: `"${nombreSprint}" tiene fecha fin pendiente o inválida.`
            });
            return;
        }

        const fechaFin = new Date(`${fechaFinStr}T00:00:00`);
        if (!Number.isNaN(fechaFin.getTime())) {
            const diasRestantes = Math.ceil((fechaFin - hoy) / msPorDia);

            if (diasRestantes < 0) {
                alertas.push({
                    tipo: 'alerta-aviso',
                    texto: `"${nombreSprint}" venció hace ${Math.abs(diasRestantes)} día(s).`
                });
            } else if (diasRestantes <= 3) {
                alertas.push({
                    tipo: 'alerta-aviso',
                    texto: `"${nombreSprint}" cierra en ${diasRestantes} día(s) (${fechaFinStr}).`
                });
            }
        }

        if (fechaInicioStr && fechaInicioStr !== '0000-00-00') {
            const fechaInicio = new Date(`${fechaInicioStr}T00:00:00`);
            if (!Number.isNaN(fechaInicio.getTime()) && fechaFin < fechaInicio) {
                alertas.push({
                    tipo: 'alerta-peligro',
                    texto: `"${nombreSprint}" tiene fecha fin anterior al inicio.`
                });
            }
        }

        const historiasDelSprint = historias.filter(
            (h) => String(h.sprint_id) === String(sprint.id)
        );
        if (historiasDelSprint.length === 0) {
            alertas.push({
                tipo: 'alerta-neutro',
                texto: `"${nombreSprint}" aún no tiene historias asignadas.`
            });
        }
    });

    const bloqueadas = historias.filter(
        (h) => (h.estado || '').toLowerCase() === 'impedimento'
    );
    if (bloqueadas.length > 0) {
        alertas.push({
            tipo: 'alerta-peligro',
            texto: `${bloqueadas.length} historia(s) marcada(s) en impedimento.`
        });
    }

    if (alertas.length === 0) {
        alertas.push({
            tipo: 'alerta-ok',
            texto: 'Todo al día: sin sprints por vencer ni impedimentos.'
        });
    }

    lista.innerHTML = alertas
        .slice(0, 5)
        .map(
            (item) => `<li class="alerta-item ${item.tipo}">${item.texto}</li>`
        )
        .join('');
}