import { getSettings, saveSettings } from "../../../lib/db";

export const onRequestGet = async () => {
  try {
    const settings = getSettings();
    return Response.json({ success: true, data: settings });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const onRequestPut = async (context: any) => {
  try {
    const body: any = await context.request.json();
    const updated = saveSettings(body);
    return Response.json({ success: true, message: "Settings saved successfully", data: updated });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};
