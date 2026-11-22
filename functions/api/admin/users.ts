import { getSupabaseClient } from "../../../lib/supabase";

export const onRequestGet = async (context: any) => {
  try {
    const supabase = getSupabaseClient(context.env);
    if (!supabase) {
      return Response.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from("ipe_users")
      .select("id, first_name, last_name, email, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ success: false, message: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data: data || [] });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

