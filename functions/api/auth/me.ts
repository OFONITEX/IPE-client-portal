export const onRequestGet = async (context: any) => {
  const cookieHeader = context.request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/identity_user_session=([^;]+)/);

  if (match && match[1]) {
    try {
      const user = JSON.parse(decodeURIComponent(match[1]));
      return Response.json({ authenticated: true, user });
    } catch {
      // invalid cookie JSON
    }
  }

  return Response.json({ authenticated: false, user: null });
};
