// fecha_Y_hora.js - Reloj y fecha del pie de pagina en horario de Uruguay.
// Arma la hora actual (HH:mm:ss) en la zona horaria de Montevideo.
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



// Arma la fecha larga actual y la escribe en el pie de pagina si existe.
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



// Reloj activo: se actualiza cada segundo; la fecha se carga una sola vez.
actualizarReloj();



setInterval(actualizarReloj, 1000);



actualizarFechaPie();