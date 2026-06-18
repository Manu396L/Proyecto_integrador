// static/js/simulador_modulos.js - Panel justo arriba del simulador de accesos

let intervalos = {
    dispositivo: null,
    alerta: null,
    ticket: null,
    sede: null,
    notificacion: null,
    usuario: null
};

let activo = {
    dispositivo: false,
    alerta: false,
    ticket: false,
    sede: false,
    notificacion: false,
    usuario: false
};

// ===== FUNCIONES DE SIMULACIÓN =====
async function simularDispositivo() {
    try {
        const response = await fetch('/dashboard/api/simular-dispositivo/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            mostrarNotificacion(`📟 ${data.mensaje}`, 'info');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function simularAlerta() {
    try {
        const response = await fetch('/dashboard/api/simular-alerta/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            const nivelClass = data.nivel === 'CRITICA' ? 'danger' : data.nivel === 'ALTA' ? 'warning' : 'info';
            mostrarNotificacion(`⚠️ Nueva alerta: ${data.mensaje} (${data.nivel})`, nivelClass);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function simularTicket() {
    try {
        const response = await fetch('/dashboard/api/simular-ticket/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            const prioridadClass = data.prioridad === 'urgente' ? 'danger' : data.prioridad === 'alta' ? 'warning' : 'info';
            mostrarNotificacion(`🎫 Nuevo ticket: ${data.titulo} (Prioridad: ${data.prioridad})`, prioridadClass);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function simularSede() {
    try {
        const response = await fetch('/dashboard/api/simular-sede/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            mostrarNotificacion(`🏢 Sede ${data.accion}: ${data.nombre}`, 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function simularNotificacion() {
    try {
        const response = await fetch('/dashboard/api/simular-notificacion/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            const prioridadClass = data.prioridad === 'critica' ? 'danger' : 
                                   data.prioridad === 'alta' ? 'warning' : 'info';
            mostrarNotificacion(`🔔 ${data.titulo} (${data.prioridad})`, prioridadClass);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function simularUsuarioNuevo() {
    try {
        const response = await fetch('/dashboard/api/simular-usuario/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        const data = await response.json();
        if (data.success) {
            mostrarNotificacion(`👤 Nueva solicitud: ${data.nombre} (DNI: ${data.dni})`, 'success');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function iniciarAutomatico(tipo, intervaloMs, btnAuto, btnManual, colorOriginal) {
    if (activo[tipo]) return;
    
    activo[tipo] = true;
    
    const ejecutar = () => {
        switch(tipo) {
            case 'dispositivo': simularDispositivo(); break;
            case 'alerta': simularAlerta(); break;
            case 'ticket': simularTicket(); break;
            case 'sede': simularSede(); break;
            case 'notificacion': simularNotificacion(); break;
            case 'usuario': simularUsuarioNuevo(); break;
        }
    };
    
    ejecutar();
    intervalos[tipo] = setInterval(ejecutar, intervaloMs);
    
    if (btnAuto) {
        btnAuto.textContent = 'Auto ON';
        btnAuto.style.background = '#27ae60';
    }
    if (btnManual) {
        btnManual.disabled = true;
        btnManual.style.opacity = '0.6';
    }
}

function detenerAutomatico(tipo, btnAuto, btnManual, colorOriginal) {
    if (intervalos[tipo]) {
        clearInterval(intervalos[tipo]);
        intervalos[tipo] = null;
    }
    activo[tipo] = false;
    
    if (btnAuto) {
        btnAuto.textContent = 'Auto';
        btnAuto.style.background = '#1e2f55';
    }
    if (btnManual) {
        btnManual.disabled = false;
        btnManual.style.opacity = '1';
        btnManual.style.background = colorOriginal;
    }
}

function crearPanelSimuladores() {
    if (document.getElementById('simuladoresPanel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'simuladoresPanel';
    panel.style.cssText = `
        position: fixed;
        bottom: 95px;
        left: 20px;
        z-index: 9997;
        background: #1e2f55;
        padding: 8px 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        width: auto;
        min-width: 200px;
    `;
    
    const colores = {
        dispositivo: '#3498db',
        alerta: '#e74c3c',
        ticket: '#f39c12',
        sede: '#2ecc71',
        notificacion: '#9b59b6',
        usuario: '#1767c8'
    };
    
    const iconos = {
        dispositivo: 'fa-microchip',
        alerta: 'fa-bell',
        ticket: 'fa-ticket-alt',
        sede: 'fa-building',
        notificacion: 'fa-bell',
        usuario: 'fa-user-plus'
    };
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; color: white; border-bottom: 1px solid #444; padding-bottom: 4px;">
            <strong style="font-size: 11px;"><i class="fas fa-play-circle"></i> Simuladores Módulos</strong>
            <button id="toggleSimuladores" style="background: none; border: none; color: white; cursor: pointer; font-size: 10px;">
                <i class="fas fa-chevron-up"></i>
            </button>
        </div>
        <div id="simuladoresContent" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${Object.keys(colores).map(tipo => `
                <div style="display: flex; flex-direction: column; align-items: center; background: #1a252f; padding: 4px 6px; border-radius: 6px; min-width: 60px;">
                    <div style="color: ${colores[tipo]}; font-size: 9px;">
                        <i class="fas ${iconos[tipo]}"></i> ${tipo === 'dispositivo' ? 'Dev' : tipo === 'alerta' ? 'Alr' : tipo === 'ticket' ? 'Tkt' : tipo === 'sede' ? 'Sd' : tipo === 'notificacion' ? 'Not' : 'Usr'}
                    </div>
                    <div style="display: flex; gap: 3px; margin-top: 2px;">
                        <button id="manual-${tipo}" class="btn-manual" data-tipo="${tipo}" data-color="${colores[tipo]}" style="background: ${colores[tipo]}; border: none; padding: 2px 5px; border-radius: 3px; color: white; cursor: pointer; font-size: 8px;">
                            M
                        </button>
                        <button id="auto-${tipo}" class="btn-auto" data-tipo="${tipo}" style="background: #1e2f55; border: 1px solid ${colores[tipo]}; padding: 2px 5px; border-radius: 3px; color: white; cursor: pointer; font-size: 8px;">
                            A
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 6px; text-align: center; padding-top: 4px; border-top: 1px solid #444;">
            <button id="detenerTodos" style="background: #e74c3c; border: none; padding: 3px 6px; border-radius: 4px; color: white; cursor: pointer; font-size: 9px; width: 100%;">
                <i class="fas fa-stop"></i> Detener todos
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    const intervalosMap = {
        dispositivo: 10000,
        alerta: 15000,
        ticket: 20000,
        sede: 30000,
        notificacion: 12000,
        usuario: 25000
    };
    
    for (const tipo of Object.keys(colores)) {
        const btnManual = document.getElementById(`manual-${tipo}`);
        const btnAuto = document.getElementById(`auto-${tipo}`);
        
        if (btnManual) {
            btnManual.addEventListener('click', async () => {
                btnManual.disabled = true;
                btnManual.style.opacity = '0.6';
                
                switch(tipo) {
                    case 'dispositivo': await simularDispositivo(); break;
                    case 'alerta': await simularAlerta(); break;
                    case 'ticket': await simularTicket(); break;
                    case 'sede': await simularSede(); break;
                    case 'notificacion': await simularNotificacion(); break;
                    case 'usuario': await simularUsuarioNuevo(); break;
                }
                
                setTimeout(() => {
                    btnManual.disabled = false;
                    btnManual.style.opacity = '1';
                }, 2000);
            });
        }
        
        if (btnAuto) {
            btnAuto.addEventListener('click', () => {
                if (activo[tipo]) {
                    detenerAutomatico(tipo, btnAuto, btnManual, colores[tipo]);
                } else {
                    iniciarAutomatico(tipo, intervalosMap[tipo], btnAuto, btnManual, colores[tipo]);
                }
            });
        }
    }
    
    document.getElementById('detenerTodos').addEventListener('click', () => {
        for (const tipo of Object.keys(colores)) {
            const btnAuto = document.getElementById(`auto-${tipo}`);
            const btnManual = document.getElementById(`manual-${tipo}`);
            if (activo[tipo]) {
                detenerAutomatico(tipo, btnAuto, btnManual, colores[tipo]);
            }
        }
        mostrarNotificacion('✅ Todos los simuladores detenidos', 'success');
    });
    
    const toggleBtn = document.getElementById('toggleSimuladores');
    const content = document.getElementById('simuladoresContent');
    let collapsed = false;
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            collapsed = !collapsed;
            content.style.display = collapsed ? 'none' : 'flex';
            toggleBtn.innerHTML = collapsed ? '<i class="fas fa-chevron-down"></i>' : '<i class="fas fa-chevron-up"></i>';
        });
    }
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    const colores = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        danger: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#f39c12', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
    };
    const color = colores[tipo] || colores.info;
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${color.bg};
        border-left: 4px solid ${color.border};
        color: ${color.text};
        padding: 6px 12px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 11px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 280px;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
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

const styleModulos = document.createElement('style');
styleModulos.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .btn-manual:hover, .btn-auto:hover {
        transform: translateY(-1px);
        filter: brightness(1.1);
    }
`;
document.head.appendChild(styleModulos);

document.addEventListener('DOMContentLoaded', function() {
    crearPanelSimuladores();
});