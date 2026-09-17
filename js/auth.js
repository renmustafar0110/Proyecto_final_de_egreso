// Control de acceso de las páginas internas

// Si no hay sesión, redirige al login
if (!sessionStorage.getItem('sesion')) {
    alert('Debe iniciar sesión para acceder a esta sección.');
    window.location.replace('loginF.html');
}