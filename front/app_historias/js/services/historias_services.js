const SPRINTS_API_URL = 'http://127.0.0.1:8001';
const HISTORIAS_API_URL = 'http://127.0.0.1:8002';

async function requestJson(url, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    };

    const response = await fetch(url, config);
    let payload = null;

    try {
        payload = await response.json();
    } catch (e) {
        payload = null;
    }

    if (!response.ok) {
        const msg = payload && payload.message
            ? payload.message
            : `Error HTTP ${response.status}`;
        throw new Error(msg);
    }

    return payload;
}

export const SprintsService = {
    getAll() {
        return requestJson(`${SPRINTS_API_URL}/sprints`);
    },
    create(data) {
        return requestJson(`${SPRINTS_API_URL}/sprints`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

export const HistoriasService = {
    getAll(filters = {}) {
        const params = new URLSearchParams();
        if (filters.sprint_id) params.append('sprint_id', filters.sprint_id);
        if (filters.estado) params.append('estado', filters.estado);

        const query = params.toString();
        const url = query
            ? `${HISTORIAS_API_URL}/historias?${query}`
            : `${HISTORIAS_API_URL}/historias`;

        return requestJson(url);
    },
    getGroupedBySprint() {
        return requestJson(`${HISTORIAS_API_URL}/historias/por-sprint`);
    },
    create(data) {
        return requestJson(`${HISTORIAS_API_URL}/historias`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    update(id, data) {
        return requestJson(`${HISTORIAS_API_URL}/historias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    delete(id) {
        return requestJson(`${HISTORIAS_API_URL}/historias/${id}`, {
            method: 'DELETE'
        });
    },
    getInforme(sprintId = '') {
        const url = sprintId
            ? `${HISTORIAS_API_URL}/informes?sprint_id=${encodeURIComponent(sprintId)}`
            : `${HISTORIAS_API_URL}/informes`;

        return requestJson(url);
    }
};