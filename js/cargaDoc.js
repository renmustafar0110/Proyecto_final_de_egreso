// Lógica de la página de Carga de Documentos

const archivo = document.getElementById('archivo');
const nombre = document.getElementById('titulo');
const boton = document.getElementById('carga_Documento');

boton.addEventListener('click', async (e) => {
    e.preventDefault();

    let doc = new FormData();
    doc.append('nombre', nombre.value);
    doc.append('archivo', archivo.files[0]);

    let respuesta = await fetch('../php/carga.php', {
        method: 'POST',
        body: doc
    });
});