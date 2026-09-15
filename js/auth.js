// Control de acceso de las páginas internas del sistema

// Si el funcionario no inició sesión se lo envía a la página de login
if (!sessionStorage.getItem('sesion')) {
    alert('Debe iniciar sesión para acceder a esta sección.');
    window.location.replace('loginF.html');
}