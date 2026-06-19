# Proyecto_integrador
BIOMETRIKA — Sistema Biométrico para Edificios

Sistema de gestión de control de acceso biométrico desarrollado en Django.
Permite administrar sedes y áreas, personal y sus credenciales biométricas
(huella, tarjeta, PIN), dispositivos de control de acceso, alertas, tickets
de soporte y reportes de actividad, todo desde un panel centralizado.

Funcionalidades principales

# Dashboard: resumen general con estadísticas, gráficos de actividad y estado de dispositivos.
# Sedes y Áreas: registro de sedes principales y áreas específicas (salas, oficinas) con su nivel de seguridad y dispositivo biométrico.
# Gestión de Personal: alta de empleados, asignación de área/sede y configuración de su método de autenticación biométrica.
# Dispositivos: administración de lectores/relojes biométricos, su red (IP, zona horaria), estado y mantenimiento.
# Alertas: monitoreo de eventos del sistema.
# Tickets / Soporte: mesa de ayuda para reportar y dar seguimiento a incidencias.
# Reportes: generación y exportación de reportes (JSON/CSV) de ubicaciones, personal y accesos.
# Usuarios: perfil, cambio de contraseña, notificaciones y solicitudesde acceso al sistema.


Requisitos previos
Python 3.10 o superior
pip

# 1. Instalación
Clonar el repositorio y entrar a la carpeta del proyecto:

    bash   git clone <url-del-repositorio>
       cd Proyecto_integrador


# 2. Borrar la carpeta venv, Crear un nuevo entorno virtual y activar:

    bash   python -m venv venv
       venv\Scripts\activate        # Windows
       source venv/bin/activate     # Linux / macOS


# 3. Instalar las dependencias:

    bash   pip install -r requirements.txt


# 4. Aplicar las migraciones para crear/actualizar la base de datos:

    bash   python manage.py migrate


# 5. Crear un usuario administrador (para entrar al sistema y al panel
/admin/):

    bash   python manage.py createsuperuser


# 6. Iniciar el servidor de desarrollo:


    bash   python manage.py runserver


# 7. Abrir el navegador en:

    Sistema: http://127.0.0.1:8000/

    Panel de administración de Django: http://127.0.0.1:8000/admin/





Uso básico


# Iniciá sesión con el usuario creado en createsuperuser (o uno cargado desde /admin/ o desde "Solicitudes de Registro").
# Desde el Dashboard vas a ver el estado general del sistema. 
# En Sedes y Áreas registrá primero tus sedes principales y luego las áreas específicas dentro de cada una.
# En Dispositivos dá de alta los lectores/relojes biométricos, asociándolos a una sede o área.
# En Gestión de Personal cargá a los empleados, asignales su sede/área y configurá su método de autenticación (huella, tarjeta o PIN).
# Alertas, Tickets y Reportes te permiten monitorear el sistema y exportar información cuando la necesites.


## Notas para reiniciar la base de datos desde cero (entorno de desarrollo) ##

Si necesitás empezar con una base de datos limpia durante el desarrollo:

bash# 1. Backup por las dudas

    copy db.sqlite3 db.sqlite3.backup      # Windows

    cp db.sqlite3 db.sqlite3.backup        # Linux / macOS

# 2. Eliminar la base de datos actual
    del db.sqlite3                         # Windows
    
    rm db.sqlite3                          # Linux / macOS

# 3. Recrear migraciones y aplicar
    python manage.py makemigrations
    
    python manage.py migrate

# 4. Crear un nuevo superusuario
    python manage.py createsuperuser

Para revisar el estado de las migraciones de cada app:

    bashpython manage.py showmigrations
    
    python manage.py migrate <nombre_de_la_app>




# Otros comandos 
# actualizar pip 
    python.exe -m pip install --upgrade pip
    
    pip install --upgrade pip

# Eliminar la base de datos actual
    del db.sqlite3

# Eliminar las carpetas de migraciones (excepto __init__.py)
    rmdir /s /q dashboard\migrations
    
    rmdir /s /q sedes\migrations

# Backup de la base de datos
    copy db.sqlite3 db.sqlite3.backup


# Repite para cada app que tengas

# Recrear las migraciones
    python manage.py makemigrations
    
    python manage.py migrate

# Ver qué migraciones están pendientes
    python manage.py showmigrations

# Aplicar una app específica
    python manage.py migrate sedes
    
    python manage.py migrate dashboard

# 1. Hacer fake de la migración inicial de sedes para resetearla
    python manage.py migrate sedes zero --fake

# 2. Volver a aplicar la migración (esto recreará las tablas)
    python manage.py migrate sedes

# 3. Verificar que la tabla se creó (opcional - saldrás con Ctrl+C)
    python manage.py dbshell
    .tables
    .exit



# Otra solucion:
  # 1. Eliminar la base de datos actual
    del db.sqlite3
    
  # 2. Eliminar el registro de migraciones (solo la carpeta __pycache__)
  # No necesitas eliminar las carpetas migrations completas
  
  # 3. Crear migraciones limpias
    python manage.py makemigrations
    
  # 4. Aplicar todas las migraciones
    python manage.py migrate
    
  # 5. Crear superusuario
    python manage.py createsuperuser
    
