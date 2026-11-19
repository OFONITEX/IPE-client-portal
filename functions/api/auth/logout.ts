export const onRequestPost = async () => {
  const response = Response.json({ success: true, message: "Signed out successfully" });
  response.headers.set(
    "Set-Cookie",
    "identity_user_session=; Path=/; Max-Age=0; SameSite=Lax"
  );
  return response;
};
