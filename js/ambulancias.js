function obtenerClaseDeEstado(estado) {
    var clases = {
        'Disponible': 'disponible',
        'Reservado': 'reservado',
        'En curso': 'en_curso',
        'En ruta': 'en_ruta',
        'Finalizado': 'finalizado'
    };

    if (clases[estado]) {
        return clases[estado];
    }

    return '';
}

function obtenerAmbulancias() {
    return fetch('../php/trazabilidad.php', { method: 'GET' })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
}