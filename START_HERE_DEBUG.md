# 🚀 Instrucciones de Debug - SEDES/ÁREAS

## TL;DR - Lo que necesitas hacer AHORA:

### 1️⃣ Terminal - Ejecutar Test Backend (2 minutos)
```bash
python test_sedes_debug.py
```
**Qué esperar:** Verás un reporte que dice si funciona o no en el backend

### 2️⃣ Browser - Debuggear Frontend (5-10 minutos)
```
1. F12 → Console
2. Ve a http://localhost:8000/sedes/
3. Llena formulario
4. Haz clic "Guardar Cambios"
5. Copia los logs de la consola
```

### 3️⃣ Reportar
Copia los logs y envía el resultado

---

## 📖 Lectura Recomendada

1. Si es tu primer debug: Lee **DEBUG_SEDES_AREAS.md** (completo, 2-3 min)
2. Si tienes prisa: Salta a sección "Puntos Críticos de Verificación"
3. Si algo falla: Busca en "Problemas Comunes y Soluciones"

---

## ¿POR QUÉ ESTO?

El usuario reportó: **"en los demas funciona, pero en la sedes y areas no funciona"**

Esto significa:
- ✅ Backend sedes/areas ORM funciona (verificado con test_seguridad.py)
- ✅ Rutas Django están correctas (404 fue arreglado)
- ❓ Algo falla entre el formulario y el servidor

Necesitamos un **registro exacto de dónde falla** para poder arreglarlo.

---

## 🎯 Resultado Esperado

### Si TODO Funciona:
1. ✅ test_sedes_debug.py: "✅ ÁREA CREADA EXITOSAMENTE"
2. ✅ Console: "===== GUARDAR UBICACION INICIADO =====" + logs
3. ✅ Console: "✅ Área creada correctamente" (en verde)
4. ✅ Tabla se actualiza, muestra el área

### Si Algo Falla:
1. ❌ Verás un log en ROJO con "ERROR"
2. ❌ O simplemente NO verás el log esperado
3. ❌ Esto te dirá EXACTAMENTE dónde está el problema

---

## 📞 Próximos Pasos

Cuando tengas los logs:

1. **Si backend test falló:** Problema en Django views
2. **Si frontend logs no aparecen:** Problema en JavaScript
3. **Si frontend logs aparecen pero error 404:** Problema en router Django
4. **Si frontend logs aparecen pero error 400/500:** Problema en validación

Cada uno tiene solución diferente, pero primero necesitamos saber **DÓNDE** falla.

---

**Última versión:** 4 de diciembre 2024

---

## ❓ Preguntas Frecuentes

**P: ¿Cuánto tiempo toma?**
R: Máximo 15 minutos (5 minutos backend, 10 minutos frontend)

**P: ¿Necesito cambiar el código?**
R: NO, solo ejecutar y reportar

**P: ¿Es seguro ejecutar test_sedes_debug.py?**
R: SÍ, solo crea datos de test temporales

**P: ¿Perderé datos existentes?**
R: NO, el test no toca datos existentes

---

🟢 **LISTO** Continúa con los pasos arriba
