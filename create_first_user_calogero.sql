-- ============================================
-- CREAR PRIMER USUARIO: Calogero Brossy
-- ============================================
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- Insertar usuario con password hasheado
INSERT INTO public.users (email, password_hash, name, avatar, role)
VALUES (
  'calubrossy@gmail.com',  -- Email (puedes cambiarlo si quieres)
  crypt('417892Calo', gen_salt('bf')),  -- Password hasheada con bcrypt
  'Calogero Brossy',
  'https://picsum.photos/seed/calogero/200',
  'CTO'
);

-- Verificar que se creó correctamente
SELECT id, email, name, role, created_at FROM public.users WHERE email = 'calubrossy@gmail.com';

-- ============================================
-- NOTA: Para loguearte usa:
-- Email: calubrossy@gmail.com
-- Password: 417892Calo
-- ============================================

