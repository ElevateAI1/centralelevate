-- ============================================
-- CREAR USUARIO INICIAL PARA LOGIN
-- ============================================
-- Este script crea un usuario inicial en Supabase
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- IMPORTANTE: Primero necesitas crear el usuario en auth.users desde el Dashboard
-- o usar la función de Supabase para crear usuarios.

-- Opción 1: Crear usuario desde Supabase Dashboard
-- 1. Ve a Authentication > Users
-- 2. Haz clic en "Add user" > "Create new user"
-- 3. Ingresa:
--    - Email: admin@nexus.ai (o el que prefieras)
--    - Password: (la que quieras)
--    - Auto Confirm User: ✅ (marcado)
-- 4. Copia el UUID del usuario creado
-- 5. Ejecuta el siguiente SQL reemplazando 'USER_UUID_AQUI' con el UUID copiado:

-- Opción 2: Usar este script después de crear el usuario en auth
-- (Reemplaza 'USER_UUID_AQUI' con el UUID del usuario de auth.users)

/*
INSERT INTO public.users (id, name, avatar, role)
VALUES (
  'USER_UUID_AQUI',  -- Reemplaza con el UUID del usuario de auth.users
  'Admin User',
  'https://picsum.photos/seed/admin/200',
  'Founder'  -- Puedes cambiar a 'CTO' si prefieres
);
*/

-- ============================================
-- ALTERNATIVA: Crear usuario completo con SQL
-- ============================================
-- Si tienes acceso a la función de Supabase para crear usuarios,
-- puedes usar este enfoque:

-- 1. Primero crea el usuario en auth.users usando Supabase Dashboard
-- 2. Luego ejecuta el INSERT de arriba

-- ============================================
-- VERIFICAR USUARIO CREADO
-- ============================================

-- Para verificar que el usuario fue creado correctamente:
-- SELECT * FROM public.users WHERE role = 'Founder' OR role = 'CTO';

