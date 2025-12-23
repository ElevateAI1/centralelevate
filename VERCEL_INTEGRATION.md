# Integración con Vercel API

## Configuración

Para habilitar la integración con Vercel API y ver el estado de los deployments en Central Elevate:

### 1. Obtener Token de Vercel

**⚠️ IMPORTANTE: Si tu proyecto está en un equipo/organización, debes crear el token desde el equipo, no desde tu cuenta personal.**

#### Si el proyecto es personal (tu cuenta):
- Ve a [Vercel Settings > Tokens](https://vercel.com/account/tokens)
- Crea un nuevo token con permisos de lectura
- Copia el token generado (solo se mostrará una vez)

#### Si el proyecto está en un equipo/organización:
- Ve a tu equipo en Vercel
- Settings del Equipo > Tokens (NO desde tu cuenta personal)
- Crea un nuevo token con permisos de lectura
- Este token tendrá acceso a todos los proyectos del equipo
- Copia el token generado (solo se mostrará una vez)

### 2. Configurar Variable de Entorno

**⚠️ IMPORTANTE: La variable DEBE tener el prefijo `VITE_` para que Vite la exponga al cliente.**

#### Para Desarrollo Local:

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_VERCEL_TOKEN=tu_token_aqui
```

#### Para Producción (Vercel):

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega una nueva variable:
   - **Key**: `VITE_VERCEL_TOKEN`
   - **Value**: Tu token de Vercel
   - **Environment**: Production, Preview, Development (o según necesites)
4. **Re-deploy** el proyecto para que las variables se apliquen

**⚠️ Nota crítica**: Si ya tienes una variable `VERCEL_TOKEN` (sin el prefijo `VITE_`), necesitas crear una nueva con el nombre `VITE_VERCEL_TOKEN`. Las variables sin el prefijo `VITE_` no son accesibles desde el código del cliente en Vite.

### 3. Obtener Vercel Project ID y Team ID (si aplica)

#### Project ID:
- Ve al proyecto en Vercel
- El Project ID se encuentra en **Settings > General**
- O puedes obtenerlo desde la URL: `vercel.com/[team]/[project]`
- El formato es: `prj_xxxxxxxxxxxxx`

#### Team ID (solo si el proyecto está en un equipo):
- Ve a tu equipo en Vercel
- **Settings del Equipo > General**
- El Team ID se encuentra en la sección de información del equipo
- El formato es: `team_xxxxxxxxxxxxx` o un slug como `nombre-del-equipo`
- **IMPORTANTE**: Si el proyecto está en un equipo, DEBES proporcionar el Team ID para que la API funcione

### 4. Usar en Central Elevate

- Al crear o editar un producto, agrega:
  - **Vercel Project ID** en el campo correspondiente
  - **Vercel Team ID** (si el proyecto está en un equipo) - esto es OBLIGATORIO para proyectos de equipo
- El sistema automáticamente consultará el estado del último deployment
- El estado se actualiza cada vez que se carga la página

**⚠️ Nota sobre equipos**: Si tu proyecto está en un equipo y no proporcionas el Team ID, recibirás un error 403. El token personal puede funcionar con proyectos de equipo si agregas el parámetro `teamId` a las llamadas de la API.

## Diagnóstico de Problemas

Si la información de Vercel no aparece:

1. **Verifica el token:**
   - Abre la consola del navegador (F12)
   - Busca mensajes que empiecen con `⚠️` o `❌`
   - Si ves "Vercel token no configurado", verifica que la variable se llame `VITE_VERCEL_TOKEN`

2. **Verifica en Vercel:**
   - Ve a Settings > Environment Variables
   - Confirma que existe `VITE_VERCEL_TOKEN` (no solo `VERCEL_TOKEN`)
   - Verifica que esté habilitada para el entorno correcto (Production/Preview)

3. **Re-deploy:**
   - Después de agregar/modificar variables de entorno, necesitas hacer un nuevo deployment
   - Las variables de entorno solo se aplican en nuevos deployments

4. **Verifica el Project ID:**
   - Asegúrate de que el Project ID sea correcto
   - Debe tener el formato `prj_xxxxxxxxxxxxx`
   - Puedes encontrarlo en Settings > General del proyecto en Vercel

5. **Error 403 - Token sin acceso al proyecto:**
   - Este error significa que el token no tiene permisos para acceder al proyecto
   - **Causa más común**: El proyecto está en un equipo y el token fue creado desde tu cuenta personal
   - **Solución**: 
     - Si el proyecto está en un equipo, crea el token desde Settings del Equipo > Tokens
     - Asegúrate de que el token pertenezca a la misma cuenta/equipo que el proyecto
     - Verifica que el token tenga permisos de lectura
     - Si cambias el token, recuerda actualizar la variable `VITE_VERCEL_TOKEN` y hacer re-deploy

## Estados de Deployment

- **READY**: Deployment exitoso y listo
- **ERROR**: Deployment falló
- **BUILDING**: Deployment en construcción
- **QUEUED**: Deployment en cola
- **CANCELED**: Deployment cancelado

## Notas

- El token se usa solo para consultar el estado, no modifica nada en Vercel
- Si no se configura el token, la funcionalidad simplemente no mostrará el estado de Vercel
- El estado se actualiza automáticamente al cargar Central Elevate
- Las variables de entorno con prefijo `VITE_` son públicas en el bundle del cliente (esto es normal y seguro para tokens de solo lectura)

