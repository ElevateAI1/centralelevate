# Cómo Crear el Primer Usuario para Login

## 🚀 Método Rápido (Recomendado)

### Paso 1: Crear usuario en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** > **Users**
3. Haz clic en **"Add user"** > **"Create new user"**
4. Completa el formulario:
   - **Email**: `admin@nexus.ai` (o el que prefieras)
   - **Password**: (elige una contraseña segura)
   - **Auto Confirm User**: ✅ **Márcalo** (importante para que pueda loguearse inmediatamente)
5. Haz clic en **"Create user"**
6. **Copia el UUID** del usuario creado (aparece en la lista de usuarios)

### Paso 2: Actualizar rol del usuario

El trigger `handle_new_user` creará automáticamente el perfil en `public.users`, pero necesitamos actualizar el rol a **Founder** o **CTO** para que puedas crear más usuarios.

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este SQL (reemplaza `TU_UUID_AQUI` con el UUID que copiaste):

```sql
UPDATE public.users
SET 
  name = COALESCE(name, 'Admin User'),
  role = 'Founder',  -- O 'CTO' si prefieres
  avatar = COALESCE(avatar, 'https://picsum.photos/seed/admin/200')
WHERE id = 'TU_UUID_AQUI';  -- Pega aquí el UUID del usuario
```

**Nota:** Si por alguna razón el trigger no creó el perfil, usa el script `setup_first_user.sql` que tiene un INSERT de respaldo.

### Paso 3: ¡Listo!

Ahora puedes:
1. Ir a tu app
2. Hacer login con el email y contraseña que creaste
3. Como eres Founder/CTO, podrás crear más usuarios desde Settings

---

## 🔧 Método Alternativo: Usando Supabase CLI

Si prefieres usar la línea de comandos:

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link tu proyecto
supabase link --project-ref tu-project-ref

# Crear usuario (esto crea en auth.users)
supabase auth create-user --email admin@nexus.ai --password tu-password --email-confirm

# Luego ejecuta el SQL de arriba para crear el perfil
```

---

## 📝 Notas Importantes

- ⚠️ **Auto Confirm User** debe estar marcado, sino el usuario no podrá loguearse
- El rol debe ser **Founder** o **CTO** para poder crear más usuarios
- Una vez que tengas el primer usuario, puedes crear más desde la app (Settings > Gestión de Usuarios)
- El UUID lo encuentras en: Authentication > Users > (click en el usuario) > User UID

---

## 🐛 Solución de Problemas

### Error: "User profile not found"
- Verifica que ejecutaste el INSERT en `public.users`
- Asegúrate de que el UUID coincida exactamente

### Error: "Email not confirmed"
- Ve a Authentication > Users
- Encuentra tu usuario
- Haz clic en los 3 puntos > "Confirm email"

### No puedo loguearme
- Verifica que el email y contraseña sean correctos
- Asegúrate de que "Auto Confirm User" estaba marcado
- Revisa la consola del navegador para ver errores

---

## ✅ Verificación

Para verificar que todo está bien:

```sql
-- Ver todos los usuarios
SELECT id, name, role, created_at FROM public.users;

-- Ver usuario específico
SELECT * FROM public.users WHERE email = 'admin@nexus.ai';
```

