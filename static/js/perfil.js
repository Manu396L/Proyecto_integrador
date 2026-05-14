js
// static/js/perfil.js

// Datos del empleado
const empleado = {
    id: 'EMP-001',
    nombre: 'Juan Pérez García',
    cargo: 'Analista de Sistemas Senior',
    area: 'Tecnología de la Información',
    correo: 'juan.perez@biometrika.com',
    tipoSede: 'Sede Principal',
    nombreSede: 'Sede Central Corporativa',
    direccion: 'Av. Principal #123, Ciudad Empresarial',
    accesos: 'Edificio A, Planta 3 - Sala de Servidores, Oficina 304',
    dispositivo: 'Lector de Huella Dactilar',
    nivelSeguridad: 'Alto',
    credencial: 'Huella registrada',
    fechaIngreso: '15/03/2022',
    ultimoAcceso: 'Hoy, 08:15 AM',
    estado: 'activo',
    telefono: '+1 234 567 8900',
    oficina: 'Oficina 304 - Planta 3',
    accesosMes: 42,
    promedioDiario: 2.8,
    ultimaActividad: '2 horas'
};

// Función para cargar los datos del empleado
function cargarDatosEmpleado() {
    // Información principal
    const nombreElem = document.getElementById('empleado-nombre');
    const cargoElem = document.getElementById('empleado-cargo');
    const idElem = document.getElementById('empleado-id');
    
    if (nombreElem) nombreElem.textContent = empleado.nombre;
    if (cargoElem) cargoElem.textContent = empleado.cargo;
    if (idElem) idElem.textContent = `ID: ${empleado.id}`;
    
    // Badges de estado
    const nivelSeguridadBadge = document.getElementById('nivel-seguridad-badge');
    if (nivelSeguridadBadge) {
        nivelSeguridadBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Nivel: ${empleado.nivelSeguridad}`;
    }

    // Información personal
    const infoId = document.getElementById('info-id');
    const infoNombre = document.getElementById('info-nombre');
    const infoCargo = document.getElementById('info-cargo');
    const infoArea = document.getElementById('info-area');
    const infoCorreo = document.getElementById('info-correo');
    const infoFechaIngreso = document.getElementById('info-fecha-ingreso');
    
    if (infoId) infoId.textContent = empleado.id;
    if (infoNombre) infoNombre.textContent = empleado.nombre;
    if (infoCargo) infoCargo.textContent = empleado.cargo;
    if (infoArea) infoArea.textContent = empleado.area;
    if (infoCorreo) infoCorreo.textContent = empleado.correo;
    if (infoFechaIngreso) infoFechaIngreso.textContent = empleado.fechaIngreso;

    // Información de ubicación
    const infoTipoSede = document.getElementById('info-tipo-sede');
    const infoNombreSede = document.getElementById('info-nombre-sede');
    const infoDireccion = document.getElementById('info-direccion');
    const infoAccesos = document.getElementById('info-accesos');
    
    if (infoTipoSede) infoTipoSede.textContent = empleado.tipoSede;
    if (infoNombreSede) infoNombreSede.textContent = empleado.nombreSede;
    if (infoDireccion) infoDireccion.textContent = empleado.direccion;
    if (infoAccesos) infoAccesos.textContent = empleado.accesos;

    // Credenciales de seguridad
    const infoDispositivo = document.getElementById('info-dispositivo');
    const infoNivelSeguridad = document.getElementById('info-nivel-seguridad');
    const infoCredencial = document.getElementById('info-credencial');
    const infoUltimoAcceso = document.getElementById('info-ultimo-acceso');
    
    if (infoDispositivo) infoDispositivo.textContent = empleado.dispositivo;
    if (infoNivelSeguridad) infoNivelSeguridad.textContent = empleado.nivelSeguridad;
    if (infoCredencial) infoCredencial.textContent = empleado.credencial;
    if (infoUltimoAcceso) infoUltimoAcceso.textContent = empleado.ultimoAcceso;

    // Tarjeta de credencial
    const credentialNombre = document.getElementById('credential-nombre');
    const credentialId = document.getElementById('credential-id');
    const credentialCargo = document.getElementById('credential-cargo');
    const credentialArea = document.getElementById('credential-area');
    const credentialTipo = document.getElementById('credential-tipo');
    
    if (credentialNombre) credentialNombre.textContent = empleado.nombre;
    if (credentialId) credentialId.textContent = `ID: ${empleado.id}`;
    if (credentialCargo) credentialCargo.textContent = empleado.cargo;
    if (credentialArea) credentialArea.textContent = empleado.area;
    if (credentialTipo) credentialTipo.textContent = empleado.dispositivo;

    // Información de contacto
    const contactCorreo = document.getElementById('contact-correo');
    const contactTelefono = document.getElementById('contact-telefono');
    const contactOficina = document.getElementById('contact-oficina');
    
    if (contactCorreo) contactCorreo.textContent = empleado.correo;
    if (contactTelefono) contactTelefono.textContent = empleado.telefono;
    if (contactOficina) contactOficina.textContent = empleado.oficina;

    // Estadísticas
    const statAccesosMes = document.getElementById('stat-accesos-mes');
    const statPromedioDiario = document.getElementById('stat-promedio-diario');
    const statUltimaActividad = document.getElementById('stat-ultima-actividad');
    
    if (statAccesosMes) statAccesosMes.textContent = empleado.accesosMes;
    if (statPromedioDiario) statPromedioDiario.textContent = empleado.promedioDiario;
    if (statUltimaActividad) statUltimaActividad.textContent = empleado.ultimaActividad;

    // Fecha de generación
    const fechaGeneracion = document.getElementById('fecha-generacion');
    if (fechaGeneracion) {
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        fechaGeneracion.textContent = fechaActual;
    }
}

// Función para editar el perfil
function editarPerfil() {
    window.location.href = '/personal/';
}

// Función para imprimir el perfil
function imprimirPerfil() {
    window.print();
}

// Función para cargar foto
function cargarFoto() {
    const profilePhoto = document.getElementById('profile-photo');
    const credentialPhoto = document.getElementById('credential-photo');
    
    if (profilePhoto) {
        profilePhoto.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
    if (credentialPhoto) {
        credentialPhoto.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
}

// Función para obtener parámetros de la URL
function obtenerParametrosURL() {
    const parametros = new URLSearchParams(window.location.search);
    return Object.fromEntries(parametros.entries());
}

// Función para cargar empleado específico
function cargarEmpleadoDesdeURL() {
    const parametros = obtenerParametrosURL();
    if (parametros.id) {
        console.log('Cargando empleado con ID:', parametros.id);
    }
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarEmpleadoDesdeURL();
    cargarDatosEmpleado();
    cargarFoto();
    console.log('Perfil del empleado cargado correctamente');
});
