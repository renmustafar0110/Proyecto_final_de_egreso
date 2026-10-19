document.addEventListener('DOMContentLoaded', function () {
    var tabla = document.getElementById('tabla-documentos');
    var aviso = document.getElementById('aviso-sin-resultados');
    var datosPaciente = document.getElementById('datos-paciente');
    var campoCategoria = document.getElementById('filtro-categoria');
    var campoTitulo = document.getElementById('filtro-titulo');
    var btnBuscar = document.getElementById('btn-buscar');
    var btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    function etiquetaCategoria(categoria) {
        var etiquetas = {
            'informacion_general': 'Información general',
            'indicaciones': 'Indicaciones médicas',
            'estudios': 'Estudios imagenológicos',
            'enfermeria': 'Enfermería',
            'encuestas': 'Encuestas'
        };
        if (etiquetas[categoria]) {
            return etiquetas[categoria];
        }
        return categoria || 'Documento';
    }

    function formatearFecha(fecha) {
        if (!fecha) return '';
        var partes = fecha.split('-');
        if (partes.length === 3) {
            return partes[2] + '/' + partes[1] + '/' + partes[0];
        }
        return fecha;
    }

    function escapar(valor) {
        if (valor == null) return '';
        var texto = String(valor);
        texto = texto.replace(/&/g, '&amp;');
        texto = texto.replace(/</g, '&lt;');
        texto = texto.replace(/>/g, '&gt;');
        texto = texto.replace(/"/g, '&quot;');
        texto = texto.replace(/'/g, '&#39;');
        return texto;
    }

    function construirUrlQR(idQr) {
        var base = new URL('../php/verDocumento.php', window.location.href);
        if (idQr) {
            base.searchParams.set('qr', idQr);
        }
        return base.href;
    }

    function construirUrlArchivo(archivo) {
        if (!archivo) return '';
        var partes = String(archivo).split('/');
        var nombre = partes[partes.length - 1];
        var base = new URL('../php/verDocumento.php', window.location.href);
        base.searchParams.set('archivo', nombre);
        return base.href;
    }

    function construirUrlVer(documento) {
        if (documento.id_qr) {
            return construirUrlQR(documento.id_qr);
        }
        return construirUrlArchivo(documento.archivo);
    }

    function cargarPaciente() {
        fetch('../php/sesion_paciente.php?accion=info')
            .then(function (r) { return r.json(); })
            .then(function (res) {
                if (res.ok) {
                    var p = res.paciente || {};
                    if (datosPaciente) {
                        var nombreCompleto = (p.nombre || '') + ' ' + (p.apellido || '');
                        nombreCompleto = nombreCompleto.trim();
                        if (nombreCompleto === '') nombreCompleto = p.cedula;
                        datosPaciente.textContent = 'Paciente: ' + nombreCompleto + ' (' + p.cedula + ')';
                    }
                    buscarDocumentos();
                } else {
                    window.location.href = 'login_Paciente.html';
                }
            })
            .catch(function () {
                window.location.href = 'login_Paciente.html';
            });
    }

    function buscarDocumentos() {
        var params = new URLSearchParams();
        if (campoCategoria && campoCategoria.value) {
            params.set('categoria', campoCategoria.value);
        }
        if (campoTitulo && campoTitulo.value.trim()) {
            params.set('titulo', campoTitulo.value.trim());
        }

        fetch('../php/buscador_documentos.php?' + params.toString())
            .then(function (r) { return r.json(); })
            .then(function (documentos) {
                if (!Array.isArray(documentos) || documentos.length === 0) {
                    tabla.innerHTML = '';
                    aviso.style.display = 'block';
                    return;
                }
                aviso.style.display = 'none';
                var filas = '';
                for (var i = 0; i < documentos.length; i++) {
                    var d = documentos[i];
                    var urlVer = construirUrlVer(d);
                    filas += '<tr>' +
                        '<td>' + escapar(d.titulo_del_documento || '') + '</td>' +
                        '<td>' + escapar(etiquetaCategoria(d.categoria_del_documento)) + '</td>' +
                        '<td>' + escapar(formatearFecha(d.fecha_publicacion)) + '</td>' +
                        '<td>' + escapar(d.nom_pac || '') + '</td>' +
                        '<td>' + escapar(d.cedula || '') + '</td>' +
                        '<td><a href="' + urlVer + '" target="_blank" rel="noopener" class="btn-ver">Ver documento</a></td>' +
                        '</tr>';
                }
                tabla.innerHTML = filas;
            })
            .catch(function () {
                tabla.innerHTML = '';
                aviso.textContent = 'No se pudieron cargar los documentos';
                aviso.style.display = 'block';
            });
    }

    btnBuscar.addEventListener('click', buscarDocumentos);

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function () {
            fetch('../php/cerrar_sesion.php')
                .then(function () {
                    window.location.href = 'index.html';
                })
                .catch(function () {
                    window.location.href = 'index.html';
                });
        });
    }

    cargarPaciente();
});
