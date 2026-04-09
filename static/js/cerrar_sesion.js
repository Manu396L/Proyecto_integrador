// static/js/cerrar_sesion.js

(function() {
    // Pequeña pausa para mostrar la animación
    setTimeout(() => {
        // Redirigir al logout de Django
        window.location.href = '/logout/';
    }, 1000);
})();