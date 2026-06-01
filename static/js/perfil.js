// static/js/perfil.js

async function cargarPerfil() {
    console.log('Cargando perfil...');
    
    try {
        const response = await fetch('/usuarios/api/perfil/');
        const data = await response.json();
        
        if (!data.success) {
            console.error('Error al cargar perfil');
            return;
        }
        
        console.log('Datos recibidos:', data);
        
        // Actualizar foto de perfil
        const profilePhoto = document.getElementById('profile-photo');
        if (profilePhoto) {
            if (data.persona && data.persona.foto) {
                profilePhoto.innerHTML = `<img src="${data.persona.foto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                profilePhoto.innerHTML = '<i class="fa-solid fa-user"></i>';
            }
        }
        
        // Información principal
        const nombreCompleto = data.persona ? `${data.persona.nombres} ${data.persona.apellidos}` : data.username;
        document.getElementById('empleado-nombre').textContent = nombreCompleto;
        document.getElementById('empleado-cargo').textContent = data.persona?.cargo || 'No especificado';
        document.getElementById('empleado-id').textContent = `ID: ${data.id}`;
        
        // Badges de estado
        const badgesContainer = document.getElementById('status-badges');
        if (data.persona && data.persona.activo) {
            badgesContainer.innerHTML = `
                <span class="badge status-activo">
                    <i class="fa-solid fa-circle"></i> Activo
                </span>
                <span class="badge">
                    <i class="fa-solid fa-shield-halved"></i> Nivel: ${data.persona.nivel_display}
                </span>
            `;
        } else {
            badgesContainer.innerHTML = `
                <span class="badge status-inactivo">
                    <i class="fa-solid fa-circle"></i> Inactivo
                </span>
            `;
        }
        
        // Información personal
        document.getElementById('info-id').textContent = data.id;
        document.getElementById('info-nombre').textContent = nombreCompleto;
        document.getElementById('info-documento').textContent = data.persona?.numero_documento || '-';
        document.getElementById('info-cargo').textContent = data.persona?.cargo || '-';
        document.getElementById('info-area').textContent = data.persona?.area_display || '-';
        document.getElementById('info-correo').textContent = data.email;
        document.getElementById('info-sede').textContent = data.persona?.nombre_sede || '-';
        document.getElementById('info-fecha-registro').textContent = data.persona?.fecha_creacion || '-';
        
        // Credenciales de seguridad
        document.getElementById('info-dispositivo').textContent = data.persona?.dispositivo_display || '-';
        document.getElementById('info-nivel-seguridad').textContent = data.persona?.nivel_display || '-';
        document.getElementById('info-credencial').textContent = data.persona?.credencial_biometrica || '-';
        
        // Tarjeta de credencial
        document.getElementById('credential-nombre').textContent = nombreCompleto;
        document.getElementById('credential-id').textContent = `ID: ${data.id}`;
        document.getElementById('credential-cargo').textContent = data.persona?.cargo || 'Empleado';
        document.getElementById('credential-tipo').textContent = data.persona?.dispositivo_display || 'Huella';
        
        // Contacto
        document.getElementById('contact-correo').textContent = data.email;
        document.getElementById('contact-telefono').textContent = data.persona?.telefono || 'No registrado';
        document.getElementById('contact-sede').textContent = data.persona?.nombre_sede || 'Sede Principal';
        
        // Estadísticas
        if (data.estadisticas) {
            document.getElementById('stat-accesos-mes').textContent = data.estadisticas.accesos_mes || 0;
            document.getElementById('stat-promedio-diario').textContent = data.estadisticas.promedio_diario || 0;
        }
        
        // Accesos recientes
        const accesosContainer = document.getElementById('accesos-container');
        if (data.ultimos_accesos && data.ultimos_accesos.length > 0) {
            accesosContainer.innerHTML = '';
            data.ultimos_accesos.forEach(acceso => {
                const accesoItem = document.createElement('div');
                accesoItem.className = 'acceso-item';
                accesoItem.innerHTML = `
                    <div class="acceso-icon">
                        <i class="fa-solid ${acceso.tipo_acceso === 'exitoso' ? 'fa-door-open' : 'fa-door-closed'}"></i>
                    </div>
                    <div class="acceso-info">
                        <div class="acceso-tipo">${acceso.dispositivo}</div>
                        <div class="acceso-fecha">${acceso.fecha_hora}</div>
                    </div>
                    <div class="acceso-estado ${acceso.clase}">${acceso.tipo_display}</div>
                `;
                accesosContainer.appendChild(accesoItem);
            });
        } else {
            accesosContainer.innerHTML = `
                <div class="acceso-item">
                    <div class="acceso-icon"><i class="fa-solid fa-info-circle"></i></div>
                    <div class="acceso-info">
                        <div class="acceso-tipo">No hay accesos registrados</div>
                    </div>
                </div>
            `;
        }
        
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
        
    } catch (error) {
        console.error('Error cargando perfil:', error);
        document.getElementById('empleado-nombre').textContent = 'Error al cargar datos';
    }
}

function editarPerfil() {
    window.location.href = '/personal/';
}

function imprimirPerfil() {
    window.print();
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    cargarPerfil();
});