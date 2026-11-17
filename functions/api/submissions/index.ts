import { getSubmissions, createSubmission, getSettings } from "../../../lib/db";
import { generateTrackingId, validateServiceCode } from "../../../lib/utils";
import { Submission, ServiceType } from "../../../lib/types";

export const onRequestGet = async (context: any) => {
  try {
    const url = new URL(context.request.url);
    const service = url.searchParams.get("service");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let items = getSubmissions();

    if (service && service !== "ALL") {
      items = items.filter((s) => s.serviceType === service);
    }
    if (status && status !== "ALL") {
      items = items.filter((s) => s.status === status);
    }
    if (search) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.identifierCode.toLowerCase().includes(q) ||
          s.applicantName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }

    return Response.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

export const onRequestPost = async (context: any) => {
  try {
    const body: any = await context.request.json();
    const {
      serviceType,
      identifierCode,
      applicantName,
      email,
      phone,
      state,
      lga,
      modificationType,
      additionalNotes,
    } = body;

    if (!serviceType || !identifierCode || !applicantName || !email || !phone) {
      return Response.json(
        { success: false, message: "Missing required fields (serviceType, identifierCode, name, email, phone)." },
        { status: 400 }
      );
    }

    const validServices: ServiceType[] = ["IPE", "MOD_IPE", "VALIDATION", "MOD_VALIDATION", "MODIFICATION"];
    if (!validServices.includes(serviceType)) {
      return Response.json(
        {
          success: false,
          message: "Invalid service type. Must be IPE, MOD_IPE, VALIDATION, MOD_VALIDATION, or MODIFICATION.",
        },
        { status: 400 }
      );
    }

    const validationResult = validateServiceCode(serviceType, identifierCode);
    if (!validationResult.isValid) {
      return Response.json(
        { success: false, message: validationResult.message },
        { status: 422 }
      );
    }

    const settings = getSettings();
    let price = 1500;
    if (serviceType === "IPE") price = settings.rates.ipe;
    else if (serviceType === "MOD_IPE") price = settings.rates.modIpe;
    else if (serviceType === "VALIDATION") price = settings.rates.validation;
    else if (serviceType === "MOD_VALIDATION") price = settings.rates.modValidation;
    else if (serviceType === "MODIFICATION") price = settings.rates.modification;

    const trackingId = generateTrackingId(serviceType);
    const newSubmission: Submission = {
      id: "sub_" + Math.random().toString(36).substring(2, 10),
      trackingId,
      serviceType,
      identifierCode: validationResult.sanitized,
      applicantName: applicantName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      state: state?.trim() || "",
      lga: lga?.trim() || "",
      modificationType: modificationType?.trim() || "",
      additionalNotes: additionalNotes?.trim() || "",
      amount: price,
      paymentStatus: "UNPAID",
      status: "PENDING_PAYMENT",
      adminAccepted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = createSubmission(newSubmission);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
};

