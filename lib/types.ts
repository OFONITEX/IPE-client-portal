export type ServiceType = 
  | "IPE" 
  | "MOD_IPE" 
  | "VALIDATION" 
  | "MOD_VALIDATION" 
  | "MODIFICATION";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export type SubmissionStatus = 
  | "PENDING_PAYMENT"
  | "PAID_PENDING_ACCEPTANCE"  // After user pays, waiting for admin to accept
  | "ACCEPTED"                 // Admin clicked Accept
  | "IN_PROGRESS"              // Admin is actively processing with regulatory DB
  | "COMPLETED"                 // Clearance slip/confirmation ready
  | "REJECTED";                // Rejected with explanation

export interface ServiceConfig {
  id: ServiceType;
  name: string;
  shortDescription: string;
  fullDescription: string;
  codeLabel: string;
  codePlaceholder: string;
  expectedLength: number;
  formatType: "ALPHANUMERIC_15" | "NUMERIC_11";
  helperText: string;
  price: number; // in NGN (Naira)
  icon: string;
  badgeText: string;
  isModification?: boolean;
}

export interface Submission {
  id: string; // unique UUID
  trackingId: string; // e.g. TRK-IPE-2026-X839A
  serviceType: ServiceType;
  identifierCode: string; // 15 alphanumeric for IPE/Mod IPE, 11 digits for Validation/Mod Validation/Modification
  
  // Applicant details
  applicantName: string;
  email: string;
  phone: string;
  state?: string;
  lga?: string;
  modificationType?: string; // For MODIFICATION: "Name Correction", "Phone Number Update", "Date of Birth", "DOB above 5 years"
  dobModificationData?: DOBModificationData; // Extended form data for DOB and DOB above 5 years modifications
  phoneModificationData?: PhoneModificationData; // Extended form data for Phone Number Update
  nameModificationData?: NameModificationData; // Extended form data for Name Correction
  additionalNotes?: string;
  
  // Payment info
  amount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentChannel?: "paystack" | "bank_transfer" | "demo_simulated";
  paidAt?: string;
  
  // Submission lifecycle & Admin Actions
  status: SubmissionStatus;
  adminAccepted: boolean;
  adminAcceptedAt?: string;
  adminAcceptedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  clearanceSlipUrl?: string;
  certificateRef?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface DOBModificationData {
  // Date of Birth fields
  oldDateOfBirth: string;
  newDateOfBirth: string;
  // Legacy Old Details (optional)
  oldSurname?: string;
  oldFirstName?: string;
  oldMiddleName?: string;
  oldTown?: string;
  oldState?: string;
  oldLGA?: string;
  oldAddress?: string;
  oldStateOfOrigin?: string;
  oldLGAOfOrigin?: string;
  oldPhoneNumber?: string;
  // New Details
  newSurname: string;
  newFirstName: string;
  newMiddleName: string;
  newTown: string;
  newState: string;
  newLGA: string;
  newAddress: string;
  newStateOfOrigin: string;
  newLGAOfOrigin: string;
  newPhoneNumber: string;
  // Father Information
  fatherFirstName: string;
  fatherSurname: string;
  fatherTown: string;
  fatherState: string;
  fatherLGA: string;
  // Mother Information
  motherFirstName: string;
  motherSurname: string;
  motherMiddleName: string;
  motherTown: string;
  motherState: string;
  // Tracking
  trackingId: string;
  // Passport photo (base64 data URL)
  passportPhoto?: string;
}

export interface PhoneModificationData {
  nin: string;
  newPhoneNumber: string;
  newEmail: string;
  emailPassword?: string;
  passportPhoto?: string;
}

export interface NameModificationData {
  nin: string;
  newSurname: string;
  newFirstName: string;
  newMiddleName: string;
  newEmail: string;
  emailPassword?: string;
  passportPhoto?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "operator";
}

export interface PortalSettings {
  portalName: string;
  portalTagline: string;
  supportEmail: string;
  supportPhone: string;
  supportWhatsApp: string;
  currency: string;
  currencySymbol: string;
  rates: {
    ipe: number;
    modIpe: number;
    validation: number;
    modValidation: number;
    modification: number;
  };
  paystack: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    testMode: boolean;
  };
}
