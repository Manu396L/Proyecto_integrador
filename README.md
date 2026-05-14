# Proyecto_integrador

# installar pip 
pip install -r requirements.txt

# actualizar pip 
python.exe -m pip install --upgrade pip
pip install --upgrade pip

# Eliminar la base de datos actual
del db.sqlite3

# Eliminar las carpetas de migraciones (excepto __init__.py)
rmdir /s /q dashboard\migrations
rmdir /s /q sedes\migrations


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
Si el problema persiste, prueba esta solución más drástica:





# Backup de la base de datos
copy db.sqlite3 db.sqlite3.backup

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

