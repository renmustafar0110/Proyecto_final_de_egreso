// ambulancias.js - Utilidades compartidas para consultar y representar ambulancias.
// Traduce el estado del traslado a la clase CSS que lo colorea.
function obtenerClaseDeEstado(estado) {
    var clases = {
        'Disponible': 'disponible',
        'Pendiente': 'pendiente',
        'En curso': 'en_curso',
        'En ruta': 'en_ruta',
        'Finalizado': 'finalizado'
    };



    if (clases[estado]) {
        return clases[estado];
    }



    return '';
}



// Pide al backend el listado de ambulancias; ante un error devuelve una lista vacia.
function obtenerAmbulancias() {
    return fetch('../php/trazabilidad.php', { method: 'GET' })
        .then(function (respuesta) {
            return respuesta.json();
        })
        .catch(function () {
            return [];
        });
}