/**
 * InstantIPESubmit Diagnostic & Verification Script
 * Run with: node .agents/skills/identity-portal-builder/scripts/verify.js
 */

const { createClient } = require("@supabase/supabase-js");

async function verify() {
  console.log("=== Checking InstantIPESubmit Architecture ===");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ Supabase credentials not found in environment. Testing in-memory fallback.");
    return;
  }

  console.log(`📡 Connecting to Supabase: ${supabaseUrl}`);
  const client = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: settings, error: sErr } = await client.from("ipe_portal_settings").select("*").single();
    if (sErr) throw sErr;
    console.log("✅ Supabase Settings connected:", {
      portal: settings.portal_name,
      rates: {
        ipe: settings.rate_ipe,
        modIpe: settings.rate_mod_ipe,
        val: settings.rate_validation,
        modVal: settings.rate_mod_validation,
        mod: settings.rate_modification,
      },
    });

    const { count, error: cErr } = await client.from("ipe_submissions").select("*", { count: "exact", head: true });
    if (cErr) throw cErr;
    console.log(`✅ Submissions Table reachable. Current record count: ${count}`);
  } catch (err) {
    console.error("❌ Supabase verification error:", err.message);
  }
}

verify();
