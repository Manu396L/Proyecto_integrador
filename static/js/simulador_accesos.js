// static/js/simulador_accesos.js - SIN TEMPERATURA
let simuladorActivo = false;
let intervaloSimulador = null;
let contadorSimulaciones = 0;

const nombres = [
    'Juan Pérez', 'María González', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez',
    'Laura Fernández', 'Miguel Sánchez', 'Sofía Ramírez', 'Diego Torres', 'Valentina Flores',
    'Andrés Castro', 'Camila Ortega', 'Javier Morales', 'Lucía Reyes', 'Fernando Guzmán',
    'Daniela Rojas', 'Ricardo Mendoza', 'Paola Silva', 'Alejandro Vega', 'Natalia Paredes'
];

const dispositivos = [
    'Terminal Recepción', 'Terminal Oficinas', 'Terminal Laboratorio', 
    'Terminal Planta Baja', 'Terminal Piso 2', 'Terminal Piso 3',
    'Terminal Gerencia', 'Terminal RH', 'Terminal Finanzas'
];

function generarAccesoAleatorio() {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const dispositivo = dispositivos[Math.floor(Math.random() * dispositivos.length)];
    const esExitoso = Math.random() > 0.2; // 80% éxito
    
    const motivosFallo = [
        'Huella no reconocida', 'Tarjeta expirada', 'PIN incorrecto',
        'Usuario no autorizado', 'Horario no permitido'
    ];
    const motivoDenegado = !esExitoso ? motivosFallo[Math.floor(Math.random() * motivosFallo.length)] : '';
    
    return {
        id: Math.floor(Math.random() * 10000),
        usuario: nombre,
        dispositivo: dispositivo,
        fecha_hora: new Date().toISOString(),
        tipo_acceso: esExitoso ? 'exitoso' : 'fallido',
        mensaje: esExitoso ? 'Acceso autorizado' : motivoDenegado
    };
}

function enviarAccesoSimulado() {
    const acceso = generarAccesoAleatorio();
    contadorSimulaciones++;
    
    console.log(`📡 [${contadorSimulaciones}] Enviando: ${acceso.usuario} - ${acceso.tipo_acceso}`);
    
    fetch('/dashboard/api/simular-acceso/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(acceso)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`✅ Acceso guardado: ${acceso.usuario}`);
            mostrarNotificacionTiempoReal(acceso);
        } else {
            console.error('❌ Error:', data.error);
        }
    })
    .catch(error => console.error('❌ Error de conexión:', error));
}

function mostrarNotificacionTiempoReal(acceso) {
    const notificacion = document.createElement('div');
    const esExitoso = acceso.tipo_acceso === 'exitoso';
    const bordeColor = esExitoso ? '#28a745' : '#dc3545';
    const bgColor = esExitoso ? '#d4edda' : '#f8d7da';
    const textoColor = esExitoso ? '#155724' : '#721c24';
    
    notificacion.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas ${esExitoso ? 'fa-check-circle' : 'fa-times-circle'}" style="font-size: 20px; color: ${bordeColor};"></i>
            <div>
                <strong>${acceso.usuario}</strong><br>
                <span style="font-size: 12px;">${esExitoso ? 'Acceso autorizado' : 'Acceso denegado'} - ${acceso.dispositivo}</span><br>
                <small>${new Date().toLocaleTimeString()}</small>
                ${!esExitoso ? `<small style="display:block;">Motivo: ${acceso.mensaje}</small>` : ''}
            </div>
        </div>
    `;
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${bordeColor};
        padding: 12px 15px;
        border-radius: 8px;
        margin-bottom: 10px;
        min-width: 280px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        color: ${textoColor};
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

function mostrarNotificacionSistema(mensaje, tipo) {
    const notificacion = document.createElement('div');
    const bgColor = tipo === 'success' ? '#d4edda' : tipo === 'error' ? '#f8d7da' : '#d1ecf1';
    const bordeColor = tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8';
    const textoColor = tipo === 'success' ? '#155724' : tipo === 'error' ? '#721c24' : '#0c5460';
    
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${bordeColor};
        color: ${textoColor};
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 13px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notificacion);
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

function iniciarSimulador() {
    if (simuladorActivo) {
        mostrarNotificacionSistema('El simulador ya está activo', 'warning');
        return;
    }
    
    simuladorActivo = true;
    contadorSimulaciones = 0;
    intervaloSimulador = setInterval(enviarAccesoSimulado, 8000);
    
    mostrarNotificacionSistema('✅ Simulador ACTIVADO - Accesos cada 8 segundos', 'success');
    
    const btnIniciar = document.getElementById('btnIniciarSimulador');
    const statusSpan = document.getElementById('simuladorStatus');
    if (btnIniciar) btnIniciar.disabled = true;
    if (statusSpan) {
        statusSpan.style.color = '#27ae60';
        statusSpan.innerHTML = '● Activo';
    }
    
    setTimeout(enviarAccesoSimulado, 1000);
}

function detenerSimulador() {
    if (intervaloSimulador) {
        clearInterval(intervaloSimulador);
        intervaloSimulador = null;
    }
    simuladorActivo = false;
    
    mostrarNotificacionSistema('⏹️ Simulador DETENIDO', 'info');
    
    const btnIniciar = document.getElementById('btnIniciarSimulador');
    const statusSpan = document.getElementById('simuladorStatus');
    if (btnIniciar) btnIniciar.disabled = false;
    if (statusSpan) {
        statusSpan.style.color = '#e74c3c';
        statusSpan.innerHTML = '● Detenido';
    }
}

function getCookie(name) {
    let value = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const c = cookie.trim();
            if (c.substring(0, name.length + 1) === (name + '=')) {
                value = decodeURIComponent(c.substring(name.length + 1));
            }
        });
    }
    return value;
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simulador de accesos cargado');
    
    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 9998;
        background: #1e2f55;
        padding: 8px 15px;
        border-radius: 30px;
        display: flex;
        gap: 10px;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    
    controlPanel.innerHTML = `
        <i class="fas fa-microchip" style="color: #1767c8;"></i>
        <span style="color: white; font-size: 12px;">Simulador:</span>
        <button id="btnIniciarSimulador" style="background: #27ae60; border: none; padding: 5px 12px; border-radius: 20px; color: white; cursor: pointer; font-size: 11px;">
            <i class="fas fa-play"></i> Iniciar
        </button>
        <button id="btnDetenerSimulador" style="background: #e74c3c; border: none; padding: 5px 12px; border-radius: 20px; color: white; cursor: pointer; font-size: 11px;">
            <i class="fas fa-stop"></i> Detener
        </button>
        <span id="simuladorStatus" style="color: #e74c3c; font-size: 10px;">● Detenido</span>
    `;
    
    document.body.appendChild(controlPanel);
    
    document.getElementById('btnIniciarSimulador').onclick = iniciarSimulador;
    document.getElementById('btnDetenerSimulador').onclick = detenerSimulador;
});