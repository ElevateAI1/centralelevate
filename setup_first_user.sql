-- ============================================
-- SCRIPT PARA CREAR PRIMER USUARIO
-- ============================================
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > Authentication > Users
-- 2. Haz clic en "Add user" > "Create new user"
-- 3. Completa:
--    - Email: admin@nexus.ai (o el que prefieras)
--    - Password: (elige una contraseña)
--    - Auto Confirm User: ✅ (MUY IMPORTANTE - márcalo)
-- 4. Crea el usuario
-- 5. Copia el UUID del usuario (aparece en la lista)
-- 6. Reemplaza 'PEGA_UUID_AQUI' abajo con ese UUID
-- 7. Ejecuta este script en SQL Editor
-- ============================================

-- El trigger handle_new_user creará automáticamente el perfil,
-- pero necesitamos actualizar el rol a Founder/CTO para que pueda crear más usuarios

UPDATE public.users
SET 
  name = COALESCE(name, 'Admin User'),
  role = 'Founder',  -- Cambia a 'CTO' si prefieres
  avatar = COALESCE(avatar, 'https://picsum.photos/seed/admin/200')
WHERE id = 'PEGA_UUID_AQUI';  -- ⚠️ REEMPLAZA ESTO con el UUID del usuario

-- Si el trigger no creó el perfil (por alguna razón), usa esto:
-- INSERT INTO public.users (id, name, avatar, role)
-- VALUES (
--   'PEGA_UUID_AQUI',
--   'Admin User',
--   'https://picsum.photos/seed/admin/200',
--   'Founder'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role;

-- Para verificar que funcionó:
-- SELECT id, name, role, created_at FROM public.users WHERE role IN ('Founder', 'CTO');

