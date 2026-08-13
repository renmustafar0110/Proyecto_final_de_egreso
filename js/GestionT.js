document.getElementById('elemento').addEventListener('change', function () {
    document.getElementById('campo_descripcion').style.display = this.value ? 'block' : 'none';
});
