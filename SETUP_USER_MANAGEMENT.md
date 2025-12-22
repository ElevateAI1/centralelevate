# Configuración de Gestión de Usuarios

## Sistema de Creación de Cuentas

Solo los roles **CTO** y **Founder** pueden crear nuevas cuentas de usuario desde la sección de Configuración.

## Pasos para Configurar

### 1. Desplegar Edge Function

1. Instala Supabase CLI si no lo tienes:
   ```bash
   npm install -g supabase
   ```

2. Inicia sesión en Supabase CLI:
   ```bash
   supabase login
   ```

3. Vincula tu proyecto:
   ```bash
   supabase link --project-ref tu-project-ref
   ```

4. Despliega la función:
   ```bash
   supabase functions deploy create-user
   ```

### 2. Configurar Variables de Entorno

La Edge Function necesita acceso al Service Role Key. Esto se configura automáticamente cuando despliegas, pero puedes verificarlo en:

- Supabase Dashboard > Project Settings > Edge Functions > Secrets

Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurado.

### 3. Configurar CORS (si es necesario)

Si tienes problemas de CORS, puedes ajustar los headers en `supabase/functions/create-user/index.ts`.

### 4. Probar el Sistema

1. Inicia sesión como CTO o Founder
2. Ve a **Settings** (Configuración)
3. Verás la sección **"Gestión de Usuarios"**
4. Haz clic en **"Crear Usuario"**
5. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Rol (Developer, Sales, CFO, CTO, Founder, Client)

## Características

✅ **Solo CTO/Founder pueden crear usuarios**  
✅ **Validación de roles**  
✅ **Creación automática de perfil** (trigger en DB)  
✅ **Lista de todos los usuarios**  
✅ **Eliminación de usuarios** (solo perfil, requiere edge function adicional para auth.users)  
✅ **UI moderna y responsive**

## Estructura de Archivos

```
supabase/
  └── functions/
      └── create-user/
          └── index.ts          # Edge Function

components/
  └── Settings/
      └── UserManagement.tsx   # Componente de gestión

components/
  └── SettingsView.tsx          # Actualizado con UserManagement
```

## Notas Importantes

- La Edge Function usa el **Service Role Key** que solo debe estar en el servidor (nunca en el frontend)
- Los usuarios creados tienen su email **auto-confirmado** (no necesitan verificar email)
- El perfil se crea automáticamente gracias al trigger `handle_new_user` en la base de datos
- Para eliminar usuarios completamente (incluyendo auth.users), necesitarías otra edge function con admin API

## Solución de Problemas

### Error: "Insufficient permissions"
- Verifica que estés logueado como CTO o Founder
- Revisa que tu perfil en `users` tenga el rol correcto

### Error: "Failed to create user"
- Verifica que la Edge Function esté desplegada
- Revisa los logs en Supabase Dashboard > Edge Functions > Logs
- Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurado

### Error de CORS
- Verifica que los headers CORS estén correctos en la función
- Asegúrate de que la URL de Supabase en `.env` sea correcta

