function actualizarReloj() {
    var ahora = new Date();
    var opciones = {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    var texto = ahora.toLocaleString('es-UY', opciones);
    document.getElementById('reloj').textContent = texto;
}

actualizarReloj();
setInterval(actualizarReloj, 1000);
