const DEFAULT_ADMIN_EMAIL = "admin@identityhub.ng";
const DEFAULT_ADMIN_PASS = "Admin@2026Password!";

export const onRequestPost = async (context: any) => {
  try {
    const { email, password } = (await context.request.json()) as any;

    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    if (
      email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() &&
      password === DEFAULT_ADMIN_PASS
    ) {
      const response = Response.json({
        success: true,
        message: "Authentication successful",
        admin: {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Chief Verification Officer",
          role: "super_admin",
        },
      });

      response.headers.set(
        "Set-Cookie",
        "identity_admin_session=authenticated_session_valid; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax"
      );

      return response;
    }

    return Response.json({ success: false, message: "Invalid email or password" }, { status: 401 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const onRequestGet = async (context: any) => {
  const cookieHeader = context.request.headers.get("Cookie") || "";
  const isAuthenticated = cookieHeader.includes("identity_admin_session=authenticated_session_valid");

  return Response.json({
    authenticated: isAuthenticated,
    admin: isAuthenticated
      ? {
          email: DEFAULT_ADMIN_EMAIL,
          name: "Chief Verification Officer",
          role: "super_admin",
        }
      : null,
  });
};

export const onRequestDelete = async () => {
  const response = Response.json({ success: true, message: "Logged out" });
  response.headers.set(
    "Set-Cookie",
    "identity_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );
  return response;
};
