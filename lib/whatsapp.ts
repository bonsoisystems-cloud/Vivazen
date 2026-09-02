import { query } from "./db";

export interface WhatsAppConfig {
  apiUrl: string;
  phoneId: string;
  token: string;
  enabled: boolean;
}

/**
 * Standardize Indian / International phone numbers for WhatsApp Cloud API.
 * Ensures numbers are in pure digits with country code, without '+' or leading zeros.
 * Example: '9876543210' -> '919876543210'
 * Example: '+91 98765 43210' -> '919876543210'
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  // If 10 digits (Standard Indian mobile), prepend 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  // If 11 digits starting with 0, replace 0 with 91
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }

  return cleaned;
}

/**
 * Retrieves the WhatsApp Cloud API credentials.
 * Prioritizes active SoftwareSettings in PostgreSQL, falling back to environment variables.
 */
export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  let apiUrl = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v20.0/";
  let phoneId = process.env.WHATSAPP_PHONE_ID || "341680609022885";
  let token = process.env.WHATSAPP_ACCESS_TOKEN || "";
  let enabled = true;

  try {
    const rows = await query(`
      SELECT "officialWhatsappEnabled", "officialWhatsappApiUrl", "officialWhatsappPhoneId", "officialWhatsappToken"
      FROM "SoftwareSettings"
      LIMIT 1
    `);

    if (rows.length > 0) {
      const s = rows[0];
      if (s.officialWhatsappApiUrl) apiUrl = s.officialWhatsappApiUrl;
      if (s.officialWhatsappPhoneId) phoneId = s.officialWhatsappPhoneId;
      if (s.officialWhatsappToken) token = s.officialWhatsappToken;
      if (typeof s.officialWhatsappEnabled === "boolean") enabled = s.officialWhatsappEnabled;
    }
  } catch (err) {
    console.warn("Could not query SoftwareSettings for WhatsApp credentials, using env defaults:", err);
  }

  return { apiUrl, phoneId, token, enabled };
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

/**
 * Send a direct freeform text message via Meta Official WhatsApp Cloud API.
 */
export async function sendWhatsAppTextMessage(params: {
  to: string;
  text: string;
}): Promise<WhatsAppSendResult> {
  const { to, text } = params;
  const config = await getWhatsAppConfig();

  if (!config.enabled) {
    return { success: false, error: "Official WhatsApp Cloud API is disabled in settings" };
  }

  if (!config.phoneId || !config.token) {
    return { success: false, error: "Missing WhatsApp Phone ID or Access Token" };
  }

  const recipient = formatWhatsAppNumber(to);
  if (!recipient || recipient.length < 10) {
    return { success: false, error: `Invalid recipient phone number: ${to}` };
  }

  const endpoint = `${config.apiUrl.replace(/\/+$/, "")}/${config.phoneId}/messages`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: true,
          body: text
        }
      })
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Meta API Error (${res.status})`;
      console.error("Meta WhatsApp Cloud API error:", data);
      return {
        success: false,
        error: errMsg,
        details: data.error
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
      details: data
    };
  } catch (err: any) {
    console.error("Network error calling WhatsApp Cloud API:", err);
    return {
      success: false,
      error: err.message || "Network error communicating with Meta Cloud API"
    };
  }
}

/**
 * Send a pre-approved template message via Meta Official WhatsApp Cloud API.
 * e.g., 'hello_world' or custom salon templates.
 */
export async function sendWhatsAppTemplateMessage(params: {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: any[];
}): Promise<WhatsAppSendResult> {
  const { to, templateName, languageCode = "en_US", components } = params;
  const config = await getWhatsAppConfig();

  if (!config.enabled) {
    return { success: false, error: "Official WhatsApp Cloud API is disabled in settings" };
  }

  if (!config.phoneId || !config.token) {
    return { success: false, error: "Missing WhatsApp Phone ID or Access Token" };
  }

  const recipient = formatWhatsAppNumber(to);
  if (!recipient || recipient.length < 10) {
    return { success: false, error: `Invalid recipient phone number: ${to}` };
  }

  const endpoint = `${config.apiUrl.replace(/\/+$/, "")}/${config.phoneId}/messages`;

  try {
    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    if (components && components.length > 0) {
      payload.template.components = components;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || `Meta API Error (${res.status})`;
      console.error("Meta WhatsApp Template API error:", data);
      return {
        success: false,
        error: errMsg,
        details: data.error
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
      details: data
    };
  } catch (err: any) {
    console.error("Network error calling WhatsApp Template API:", err);
    return {
      success: false,
      error: err.message || "Network error communicating with Meta Cloud API"
    };
  }
}
