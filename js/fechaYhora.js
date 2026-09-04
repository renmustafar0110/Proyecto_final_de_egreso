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

actualizarReloj();
setInterval(actualizarReloj, 1000);
actualizarFechaPie();
