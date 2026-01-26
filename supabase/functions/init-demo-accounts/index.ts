import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isDemo: boolean;
}

// Demo Super Admin account
const DEMO_SUPER_ADMIN: DemoUser = {
  email: "superadmin@demo.idetude.app",
  password: "Demo2025!",
  firstName: "Super",
  lastName: "Administrateur",
  role: "super_admin",
  isDemo: true,
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { action } = await req.json();

    if (action === "init") {
      // Check if demo super admin already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingAdmin = existingUsers?.users?.find(
        (u) => u.email === DEMO_SUPER_ADMIN.email
      );

      if (existingAdmin) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Demo Super Admin already exists",
            userId: existingAdmin.id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create the demo super admin user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: DEMO_SUPER_ADMIN.email,
        password: DEMO_SUPER_ADMIN.password,
        email_confirm: true,
        user_metadata: {
          first_name: DEMO_SUPER_ADMIN.firstName,
          last_name: DEMO_SUPER_ADMIN.lastName,
        },
      });

      if (createError) {
        throw createError;
      }

      // Update profile to mark as demo
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ is_demo: true })
        .eq("id", newUser.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Assign super_admin role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: DEMO_SUPER_ADMIN.role,
        });

      if (roleError) {
        throw roleError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Demo Super Admin created successfully",
          userId: newUser.user.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
