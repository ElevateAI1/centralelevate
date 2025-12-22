# Configuración de Autenticación con Supabase

## Pasos para configurar el sistema de login/register

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración (2-3 minutos)

### 2. Ejecutar el script SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido completo de `supabase_schema.sql`
3. Ejecuta el script (botón "Run" o `Ctrl+Enter`)
4. Verifica que todas las tablas se hayan creado correctamente

### 3. Obtener las credenciales de API

1. En tu proyecto de Supabase, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`)
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**⚠️ IMPORTANTE:**
- No subas el archivo `.env` a Git (ya está en `.gitignore`)
- El archivo `.env.example` es solo una plantilla

### 5. Instalar dependencias (si no lo has hecho)

```bash
npm install
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 7. Probar el sistema

1. Abre la aplicación en tu navegador
2. Deberías ver la pantalla de login
3. Haz clic en "Regístrate aquí" para crear una cuenta
4. Completa el formulario de registro
5. Una vez registrado, serás redirigido automáticamente

## Características implementadas

✅ **Login** - Autenticación con email y contraseña  
✅ **Register** - Registro de nuevos usuarios con selección de rol  
✅ **Sesión persistente** - La sesión se mantiene al recargar la página  
✅ **Logout** - Botón de logout en el header  
✅ **Protección de rutas** - Solo usuarios autenticados pueden acceder  
✅ **Perfil automático** - Se crea automáticamente al registrarse (trigger en DB)

## Estructura de archivos

```
lib/
  └── supabase.ts          # Cliente de Supabase

components/
  └── Auth/
      ├── Login.tsx        # Componente de login
      ├── Register.tsx     # Componente de registro
      └── AuthView.tsx     # Wrapper que maneja login/register

store.tsx                  # Store actualizado con autenticación
App.tsx                    # App actualizado con protección de rutas
```

## Notas importantes

- El trigger `handle_new_user` en la base de datos crea automáticamente el perfil en `public.users` cuando alguien se registra
- Los roles disponibles son: `Founder`, `CTO`, `Developer`, `Sales`, `CFO`, `Client`
- Por defecto, los nuevos usuarios se registran como `Developer`
- La sesión se sincroniza automáticamente entre pestañas del navegador

## Solución de problemas

### Error: "Supabase URL or Anon Key not found"
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de crear/modificar `.env`

### Error al registrarse
- Verifica que el script SQL se ejecutó correctamente
- Revisa la consola del navegador para más detalles
- Verifica que el trigger `handle_new_user` existe en la base de datos

### No se crea el perfil automáticamente
- Verifica que el trigger `on_auth_user_created` está activo en Supabase
- Revisa los logs en Supabase Dashboard > Logs > Database

