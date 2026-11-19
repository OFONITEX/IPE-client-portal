import { getSupabaseClient } from "../../lib/supabase";

export const onRequestPost = async (context: any) => {
  try {
    const { email, password } = (await context.request.json()) as any;

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Supabase if connected
    const supabase = getSupabaseClient(context.env);
    if (supabase) {
      const { data: userRecord, error } = await supabase
        .from("ipe_users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!error && userRecord) {
        if (userRecord.password_hash === password) {
          const user = {
            id: userRecord.id,
            firstName: userRecord.first_name,
            lastName: userRecord.last_name,
            email: userRecord.email,
            createdAt: userRecord.created_at,
          };

          const response = Response.json({ success: true, user });
          response.headers.set(
            "Set-Cookie",
            `identity_user_session=${encodeURIComponent(
              JSON.stringify(user)
            )}; Path=/; Max-Age=2592000; SameSite=Lax`
          );
          return response;
        } else {
          return Response.json(
            { success: false, message: "Invalid email or password" },
            { status: 401 }
          );
        }
      }
    }

    return Response.json(
      { success: false, message: "User not found or credentials invalid. Please sign up." },
      { status: 401 }
    );
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};
