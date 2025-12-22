# Cómo Desplegar las Edge Functions

## ⚠️ IMPORTANTE: Las Edge Functions NO funcionan solo con el código local

Las Edge Functions de Supabase **deben ser desplegadas** en Supabase para funcionar. El código en `supabase/functions/` es solo el código fuente que necesitas desplegar.

## Opción 1: Usando Supabase CLI (Recomendado)

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Iniciar sesión

```bash
supabase login
```

### 3. Vincular tu proyecto

```bash
supabase link --project-ref tu-project-ref
```

Para obtener tu `project-ref`:
- Ve a tu proyecto en Supabase Dashboard
- Settings > General
- Copia el "Reference ID"

### 4. Desplegar la función

```bash
# Desplegar manage-users (una sola función para todo)
supabase functions deploy manage-users
```

### 5. Verificar el despliegue

Ve a: Supabase Dashboard > Edge Functions

Deberías ver la función `manage-users` listada.

## Opción 2: Desde el Dashboard de Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Edge Functions**
3. Haz clic en **"Create a new function"**
4. Nombre: `manage-users`
5. Copia y pega el contenido de `supabase/functions/manage-users/index.ts`

## Configurar Variables de Entorno

Las Edge Functions necesitan acceso a:
- `SUPABASE_URL` - Se configura automáticamente
- `SUPABASE_ANON_KEY` - Se configura automáticamente
- `SUPABASE_SERVICE_ROLE_KEY` - **Debes configurarlo manualmente**

### Configurar Service Role Key:

1. Ve a Supabase Dashboard > Settings > API
2. Copia el **"service_role" key** (⚠️ NUNCA lo expongas en el frontend)
3. Ve a Edge Functions > Settings > Secrets
4. Agrega un nuevo secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (pega el service_role key)

## Probar las Funciones

### Desde el Dashboard:
1. Ve a Edge Functions
2. Selecciona una función
3. Haz clic en "Invoke"
4. Prueba con diferentes payloads

### Desde tu App:
Una vez desplegada, la función estará disponible en:
- `https://tu-proyecto.supabase.co/functions/v1/manage-users`

Usa el parámetro `action` para especificar la operación:
- `{ action: 'create', email, password, name, role }`
- `{ action: 'update', userId, name?, role?, email?, password? }`
- `{ action: 'delete', userId }`

## Estructura de Archivos

```
supabase/
  └── functions/
      └── manage-users/
          └── index.ts      # Crear, actualizar y eliminar usuarios
```

## Solución de Problemas

### Error: "Function not found"
- Verifica que la función esté desplegada
- Revisa que el nombre de la función coincida exactamente

### Error: "Service role key not found"
- Asegúrate de haber configurado el secret en Edge Functions
- Verifica que el nombre sea exactamente `SUPABASE_SERVICE_ROLE_KEY`

### Error de CORS
- Las funciones ya incluyen headers CORS
- Si persiste, verifica que estés usando la URL correcta

### Error: "Insufficient permissions"
- Verifica que estés logueado como CTO o Founder
- Revisa que tu perfil en `users` tenga el rol correcto

## Notas Importantes

- ⚠️ **NUNCA** expongas el `SUPABASE_SERVICE_ROLE_KEY` en el frontend
- Las Edge Functions se ejecutan en el servidor de Supabase
- Los logs están disponibles en: Dashboard > Edge Functions > Logs
- Puedes probar las funciones localmente con: `supabase functions serve`

