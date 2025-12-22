// Supabase Edge Function to manage users (create, update, delete)
// Only accessible by authenticated users with CTO or Founder role

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !currentUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is CTO or Founder
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userProfile.role !== 'CTO' && userProfile.role !== 'Founder') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only CTO and Founder can manage users.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { action, ...data } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing action parameter. Use: create, update, or delete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Handle different actions
    switch (action) {
      case 'create': {
        const { email, password, name, role } = data;

        if (!email || !password || !name || !role) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: email, password, name, role' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate role
        const validRoles = ['Founder', 'CTO', 'Developer', 'Sales', 'CFO', 'Client'];
        if (!validRoles.includes(role)) {
          return new Response(
            JSON.stringify({ error: 'Invalid role' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create the user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            role,
            avatar: `https://picsum.photos/seed/${email}/200`,
          },
        });

        if (authError || !authData.user) {
          return new Response(
            JSON.stringify({ error: authError?.message || 'Failed to create user' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Ensure profile exists (trigger should create it, but we'll upsert to be safe)
        const { error: profileCreateError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: authData.user.id,
            name,
            role,
            avatar: `https://picsum.photos/seed/${email}/200`,
          }, {
            onConflict: 'id',
          });

        if (profileCreateError) {
          console.error('Error creating user profile:', profileCreateError);
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: authData.user.id,
              email: authData.user.email,
              name,
              role,
            },
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        const { userId, name, role, email, password } = data;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate role if provided
        if (role) {
          const validRoles = ['Founder', 'CTO', 'Developer', 'Sales', 'CFO', 'Client'];
          if (!validRoles.includes(role)) {
            return new Response(
              JSON.stringify({ error: 'Invalid role' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Update user profile
        const updateData: any = {};
        if (name) updateData.name = name;
        if (role) updateData.role = role;

        const { error: profileUpdateError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (profileUpdateError) {
          return new Response(
            JSON.stringify({ error: profileUpdateError.message || 'Failed to update user profile' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update auth user if email or password provided
        if (email || password) {
          const authUpdateData: any = {};
          if (email) authUpdateData.email = email;
          if (password) authUpdateData.password = password;

          const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            authUpdateData
          );

          if (authUpdateError) {
            return new Response(
              JSON.stringify({ error: authUpdateError.message || 'Failed to update auth user' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // Get updated user
        const { data: updatedUser, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch updated user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: updatedUser,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        const { userId } = data;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Prevent self-deletion
        if (userId === currentUser.id) {
          return new Response(
            JSON.stringify({ error: 'You cannot delete your own account' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete user from auth (this will cascade delete the profile due to ON DELETE CASCADE)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message || 'Failed to delete user' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User deleted successfully',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: create, update, or delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

