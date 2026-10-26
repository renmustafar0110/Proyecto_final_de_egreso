// Funciones compartidas entre las paginas

function escapar(valor) {
    if (valor == null) {
        return '';
    }

    var texto = String(valor);
    texto = texto.replace(/&/g, '&amp;');
    texto = texto.replace(/</g, '&lt;');
    texto = texto.replace(/>/g, '&gt;');
    texto = texto.replace(/"/g, '&quot;');
    texto = texto.replace(/'/g, '&#39;');

    return texto;
}

function formatearFechaHora(valor) {
    if (valor == null || valor == '') {
        return '—';
    }

    var partes = valor.split(' ');
    var fecha = partes[0];
    var hora = '';

    if (partes.length > 1) {
        hora = partes[1].substring(0, 5);
    }

    var dia = fecha.split('-');

    if (dia.length != 3) {
        return valor;
    }

    var texto = dia[2] + '/' + dia[1] + '/' + dia[0];

    if (hora != '') {
        texto = texto + ' ' + hora;
    }

    return texto;
}

function etiquetaElemento(tipo) {
    if (tipo == 'equipamiento_medico') {
        return 'Equipamiento médico';
    }

    if (tipo == 'muestra_biologica') {
        return 'Muestra biológica';
    }

    if (tipo == 'paciente_biologico') {
        return 'Paciente biológico';
    }

    return tipo || 'Elemento';
}

function textoElemento(traslado) {
    var partes = [];

    if (traslado.elemento_dato1) {
        partes.push(traslado.elemento_dato1);
    }

    if (traslado.elemento_dato2) {
        partes.push(traslado.elemento_dato2);
    }

    var texto = partes.length > 0 ? partes.join(' / ') : (traslado.elemento_descripcion || '—');

    if (traslado.elemento_dato3) {
        texto = texto + ' — ' + traslado.elemento_dato3;
    }

    return etiquetaElemento(traslado.elemento_tipo) + ': ' + texto;
}

function claseEstado(estado) {
    if (estado == 'Pendiente') {
        return 'estado-pendiente';
    }

    if (estado == 'En curso') {
        return 'estado-en-curso';
    }

    if (estado == 'En ruta') {
        return 'estado-en-ruta';
    }

    if (estado == 'Llegada a destino') {
        return 'estado-llegada';
    }

    if (estado == 'Retorno') {
        return 'estado-retorno';
    }

    if (estado == 'Finalizado') {
        return 'estado-finalizado';
    }

    return '';
}