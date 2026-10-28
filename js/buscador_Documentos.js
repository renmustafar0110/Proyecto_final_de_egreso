document.addEventListener('DOMContentLoaded', function () {
    var tabla = document.getElementById('tabla-documentos');
    var aviso = document.getElementById('aviso-sin-resultados');
    var datosPaciente = document.getElementById('datos-paciente');
    var campoCategoria = document.getElementById('filtro-categoria');
    var campoTitulo = document.getElementById('filtro-titulo');
    var btnBuscar = document.getElementById('btn-buscar');
    var btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
    var btnEncuestasPendientes = document.getElementById('btn-encuestas-pendientes');
    var modalEncuestas = document.getElementById('modal-encuestas');
    var btnCerrarEncuestas = document.getElementById('btn-cerrar-encuestas');
    var listaEncuestasPaciente = document.getElementById('lista-encuestas-paciente');
    var encuestasMensaje = document.getElementById('encuestas-mensaje');
    var modalVerQr = document.getElementById('modal-ver-qr');
    var btnCerrarVerQr = document.getElementById('btn-cerrar-ver-qr');
    var qrVerTitulo = document.getElementById('qr-ver-titulo');
    var qrVerCategoria = document.getElementById('qr-ver-categoria');
    var qrVerImagen = document.getElementById('qr-ver-imagen');

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
                    var btnQr = '';
                    if (d.id_qr) {
                        btnQr = '<button type="button" class="btn-mostrar-qr" data-url="' + escapar(urlVer) + '" data-titulo="' + escapar(d.titulo_del_documento || '') + '" data-categoria="' + escapar(d.categoria_del_documento || '') + '">Mostrar QR</button>';
                    } else {
                        btnQr = '-';
                    }
                    filas += '<tr>' +
                        '<td>' + escapar(d.titulo_del_documento || '') + '</td>' +
                        '<td>' + escapar(etiquetaCategoria(d.categoria_del_documento)) + '</td>' +
                        '<td>' + escapar(formatearFecha(d.fecha_publicacion)) + '</td>' +
                        '<td>' + escapar(d.nom_pac || '') + '</td>' +
                        '<td>' + escapar(d.cedula || '') + '</td>' +
                        '<td>' + btnQr + '</td>' +
                        '</tr>';
                }
                tabla.innerHTML = filas;

                var botonesQr = tabla.querySelectorAll('.btn-mostrar-qr');
                for (var j = 0; j < botonesQr.length; j++) {
                    botonesQr[j].addEventListener('click', function () {
                        var doc = {
                            titulo_del_documento: this.getAttribute('data-titulo'),
                            categoria_del_documento: this.getAttribute('data-categoria')
                        };
                        mostrarQrDocumento(doc, this.getAttribute('data-url'));
                    });
                }
            })
            .catch(function () {
                tabla.innerHTML = '';
                aviso.textContent = 'No se pudieron cargar los documentos';
                aviso.style.display = 'block';
            });
    }

    function cargarEncuestasPendientes() {
        if (listaEncuestasPaciente) {
            listaEncuestasPaciente.innerHTML = '';
        }
        if (encuestasMensaje) {
            encuestasMensaje.textContent = 'Cargando encuestas...';
            encuestasMensaje.style.display = 'block';
        }

        fetch('../php/listar_encuestas_paciente.php')
            .then(function (r) { return r.json(); })
            .then(function (encuestas) {
                if (encuestasMensaje) {
                    encuestasMensaje.style.display = 'none';
                }
                if (!Array.isArray(encuestas) || encuestas.length === 0) {
                    if (encuestasMensaje) {
                        encuestasMensaje.textContent = 'No hay encuestas pendientes.';
                        encuestasMensaje.style.display = 'block';
                    }
                    return;
                }

                var html = '';
                for (var i = 0; i < encuestas.length; i++) {
                    var e = encuestas[i];
                    html += '<li class="encuesta-item">' +
                        '<div class="encuesta-info">' +
                        '<strong>' + escapar(e.titulo || '') + '</strong>' +
                        '<p>' + escapar(e.descripcion || '') + '</p>' +
                        '</div>' +
                        '<a class="btn-responder-encuesta" href="../php/responderEncuesta.php?id=' + encodeURIComponent(e.id_encuesta) + '" target="_blank" rel="noopener">Responder</a>' +
                        '</li>';
                }
                if (listaEncuestasPaciente) {
                    listaEncuestasPaciente.innerHTML = html;
                }
            })
            .catch(function () {
                if (encuestasMensaje) {
                    encuestasMensaje.textContent = 'No se pudieron cargar las encuestas.';
                    encuestasMensaje.style.display = 'block';
                }
            });
    }

    if (btnEncuestasPendientes) {
        btnEncuestasPendientes.addEventListener('click', function () {
            if (modalEncuestas) {
                modalEncuestas.style.display = 'flex';
                cargarEncuestasPendientes();
            }
        });
    }

    if (btnCerrarEncuestas) {
        btnCerrarEncuestas.addEventListener('click', function () {
            if (modalEncuestas) {
                modalEncuestas.style.display = 'none';
            }
        });
    }

    if (modalEncuestas) {
        modalEncuestas.addEventListener('click', function (evento) {
            if (evento.target === modalEncuestas) {
                modalEncuestas.style.display = 'none';
            }
        });
    }

    if (btnCerrarVerQr) {
        btnCerrarVerQr.addEventListener('click', function () {
            if (modalVerQr) {
                modalVerQr.style.display = 'none';
            }
        });
    }

    if (modalVerQr) {
        modalVerQr.addEventListener('click', function (evento) {
            if (evento.target === modalVerQr) {
                modalVerQr.style.display = 'none';
            }
        });
    }

    function mostrarQrDocumento(documento, urlVer) {
        if (!modalVerQr) {
            return;
        }

        if (qrVerTitulo) {
            qrVerTitulo.textContent = documento.titulo_del_documento || 'Sin título';
        }

        if (qrVerCategoria) {
            qrVerCategoria.textContent = 'Categoría: ' + etiquetaCategoria(documento.categoria_del_documento);
        }

        if (qrVerImagen) {
            try {
                var qrUrlObj = new URL(urlVer, window.location.href);
                qrVerImagen.src = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(qrUrlObj.href);
            } catch (e) {
                qrVerImagen.src = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(urlVer);
            }
        }

        modalVerQr.style.display = 'flex';
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
