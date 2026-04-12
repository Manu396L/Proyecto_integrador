# 🔧 DEBUGGING COMPLETO: Sedes/Áreas - 4 de Diciembre 2024

## 📋 Resumen de Cambios

Se han implementado **mejoras masivas de logging** para diagnosticar exactamente dónde está fallando el flujo de creación de áreas.

### ✅ Cambios Realizados

#### 1. **static/js/ubicaciones.js** - Logging Exhaustivo (MEJORADO)
- ✅ Inicio de función con banner colorido
- ✅ Validación de campos con logs detallados
- ✅ Construcción de URL y datos con logs a cada paso
- ✅ **PUNTO CRÍTICO**: Ahora especifica EXACTAMENTE cuál es la URL a la que va a enviar
- ✅ Respuesta del servidor con status HTTP
- ✅ Error handling con stack traces completos
- ✅ Cargar ubicaciones con conteo de sedes/áreas

#### 2. **sedes/views.py** - Logging en Backend (MEJORADO)
- ✅ Punto de entrada visible: "🔔 ENDPOINT /sedes/api/areas/crear/ ACCEDIDO"
- ✅ Logs de método HTTP y Content-Type
- ✅ Logs de datos recibidos con cada campo
- ✅ Validación visible: qué campo falla exactamente

#### 3. **test_sedes_debug.py** - Script de Diagnóstico (NUEVO)
- ✅ Test 1: Simula POST desde backend (como lo hace JavaScript)
- ✅ Test 2: Verifica qué hay en la base de datos
- ✅ Test 3: Verifica respuesta de GET /sedes/api/areas/

---

## 🎯 Cómo Usar Este Debug

### Paso 1: Ejecutar el Test del Backend
```bash
python test_sedes_debug.py
```

**Esto te dirá:**
1. ✅ Si el backend PUEDE crear áreas (ORM funciona)
2. ✅ Si el nivel_seguridad se guarda correctamente
3. ✅ Si GET /sedes/api/areas/ retorna los datos

---

### Paso 2: Debuggear Frontend

#### 2.1. Abre DevTools
1. Ve a http://localhost:8000/sedes/
2. Presiona **F12** → Abre DevTools
3. Ve a la pestaña **"Console"**

#### 2.2. Llenar Formulario
```
Tipo: "Área Específica"
Nombre: "Test Debug"
Código: "TEST-DBG-001"  
Nivel Seguridad: "Alto"
```

#### 2.3. Haz clic en "Guardar Cambios"

#### 2.4. Busca estos Colores en la Consola

| Color | Significado | Estado |
|-------|------------|--------|
| 🔴 Rojo | CRÍTICO - Fallo total | Si ves esto, anota exactamente qué dice |
| 🟣 Púrpura | Info importante | Normal, continúa |
| 🟢 Verde | ÉXITO - Paso completado | Normal, continúa |
| 🟠 Naranja | ADVERTENCIA | Revisa |

---

## 📊 Puntos Críticos de Verificación

### Si VES este log:
```
===== GUARDAR UBICACION INICIADO =====
```
✅ El event listener del formulario FUNCIONA

### Si NO ves nada:
❌ El formulario no se está enviando
- Revisa que hayas clickeado el botón correcto
- Revisa que el navegador no tenga errores en extensiones
- Abre una pestaña incógnita

---

### Si VES este log:
```
--- RESPUESTA RECIBIDA DEL SERVIDOR ---
HTTP Status: 200
```
✅ El POST llegó al servidor

### Si SOLO VES:
```
HTTP Status: 404
```
❌ La URL es incorrecta
- Verifica que el router Django está correcto
- Revisa que la ruta `/sedes/api/areas/crear/` existe

---

### Si VES este log:
```
✅ Validación HTML PASADA
--- LISTA PARA ENVIAR ---
URL final: /sedes/api/areas/crear/
Datos a enviar: {
  "sede_id": 1,
  "nombre": "...",
  "codigo_acceso": "...",
  "nivel_seguridad": "alto",  ← AQUÍ DEBE ESTAR
  ...
}
```
✅ Los datos se construyeron correctamente

### Si el `nivel_seguridad` está:
- ✅ "alto" → correcto
- ✅ "medio" → correcto
- ✅ "bajo" → correcto
- ❌ Vacío o undefined → PROBLEMA en JavaScript

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No veo logs en la consola"
**Solución:** 
1. Recarga la página (Ctrl+R)
2. Abre DevTools ANTES de hacer clic en "Guardar"
3. Revisa que la consola esté abierta y filtrada correctamente

### Problema 2: "Veo '❌ VALIDACION HTML FALLIDA'"
**Solución:**
- Significa que NO completaste un campo requerido
- Campos requeridos: Tipo, Nombre, Código
- El select de Tipo DEBE cambiar de "Seleccione un tipo"

### Problema 3: "HTTP Status: 400"
**Solución:**
- El servidor validó y rechazó los datos
- Mira el "message" field en la respuesta
- Es probablemente "Sede requerida" → sede_id es 1 en JavaScript

### Problema 4: "HTTP Status: 500"
**Solución:**
- Error en el backend
- Revisa el server log (terminal donde corre Django)
- Busca "Traceback" para ver el error exacto

---

## 📋 Checklist de Debuggeo

```
☐ He ejecutado: python test_sedes_debug.py
☐ El backend test dice: ✅ ÁREA CREADA EXITOSAMENTE
☐ El backend test muestra nivel_seguridad = 'alto'
☐ He abierto DevTools (F12)
☐ Estoy en la consola correcta, no en "Network"
☐ He llenado el formulario completamente
☐ El select de Tipo NO dice "Seleccione un tipo"
☐ He hecho clic en "Guardar Cambios"
☐ Veo "===== GUARDAR UBICACION INICIADO =====" en la consola
☐ Veo "✅ Validación HTML PASADA"
☐ Veo "--- RESPUESTA RECIBIDA DEL SERVIDOR ---"
☐ Veo HTTP Status 200 OK
☐ Veo "✅ Área creada correctamente" en el mensaje verde
```

---

## 📝 Información para Reportar

Cuando reportes el problema, por favor incluye:

1. **Output de test_sedes_debug.py**
   - Copia la línea donde dice si el área se creó o no

2. **Logs de la consola del navegador** (Copiar-pegar desde F12)
   - Desde el primer "===== GUARDAR UBICACION INICIADO ====="
   - Hasta el último "RESPUESTA RECIBIDA DEL SERVIDOR"

3. **El valor exacto de estos campos:**
   - URL final:
   - Método:
   - Nivel Seguridad:
   - HTTP Status:

**Ejemplo:**
```
Test backend: ✅ ÁREA CREADA EXITOSAMENTE - Nivel: alto
Frontend URL: /sedes/api/areas/crear/
Frontend Nivel: alto
HTTP Status: 200
```

---

## 🔍 Verificación Rápida

Si TODO funciona, deberías ver:

1. ✅ test_sedes_debug.py dice "✅ ÁREA CREADA EXITOSAMENTE"
2. ✅ Consola del navegador dice "✅ Área creada correctamente"
3. ✅ La tabla de ubicaciones se actualiza y muestra el área
4. ✅ El nivel de seguridad es el que seleccionaste (no "Medio")

---

**Última actualización:** 4 de diciembre 2024
**Estado:** Awaiting user feedback with full logs
