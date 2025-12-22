# Integración con Vercel API

## Configuración

Para habilitar la integración con Vercel API y ver el estado de los deployments en Central Elevate:

1. **Obtener Token de Vercel:**
   - Ve a [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Crea un nuevo token con permisos de lectura
   - Copia el token generado

2. **Configurar Variable de Entorno:**
   - Agrega el token a tu archivo `.env.local`:
   ```
   VITE_VERCEL_TOKEN=tu_token_aqui
   ```

3. **Obtener Vercel Project ID:**
   - Ve al proyecto en Vercel
   - El Project ID se encuentra en Settings > General
   - O puedes obtenerlo desde la URL: `vercel.com/[team]/[project]`
   - El formato es: `prj_xxxxxxxxxxxxx`

4. **Usar en Central Elevate:**
   - Al crear o editar un producto, agrega el Vercel Project ID
   - El sistema automáticamente consultará el estado del último deployment
   - El estado se actualiza cada vez que se carga la página

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

