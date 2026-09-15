// Reloj del encabezado y fecha del pie de página

// Actualiza el reloj con la hora de Montevideo
function actualizarReloj() {
    var ahora = new Date();
    var opciones = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    var texto = ahora.toLocaleString('es-UY', opciones);
    document.getElementById('reloj').textContent = texto;
}

// Actualiza la fecha que se muestra en el pie de página
function actualizarFechaPie() {
    var ahora = new Date();
    var opciones = {
        timeZone: 'America/Montevideo',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };
    var pie = document.getElementById('fechaPie');
    if (pie) {
        pie.textContent = ahora.toLocaleDateString('es-UY', opciones);
    }
}

// Se muestra el reloj apenas carga la página
actualizarReloj();

// El reloj se actualiza cada segundo
setInterval(actualizarReloj, 1000);

// Se muestra la fecha del pie de página
actualizarFechaPie();