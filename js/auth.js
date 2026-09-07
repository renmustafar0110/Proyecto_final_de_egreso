if (!sessionStorage.getItem('sesion')) {
    alert('Debe iniciar sesión para acceder a esta sección.');
    window.location.replace('loginF.html');
}