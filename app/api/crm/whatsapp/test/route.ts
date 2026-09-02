import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getWhatsAppConfig, sendWhatsAppTextMessage, sendWhatsAppTemplateMessage, formatWhatsAppNumber } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const testPhone = body.phone ? formatWhatsAppNumber(body.phone) : "";

    const config = await getWhatsAppConfig();

    // Override with request body if user is testing unsaved credentials in settings
    if (body.apiUrl) config.apiUrl = body.apiUrl;
    if (body.phoneId) config.phoneId = body.phoneId;
    if (body.token) config.token = body.token;

    const endpoint = `${config.apiUrl.replace(/\/+$/, "")}/debug_token?input_token=${config.token}&access_token=${config.token}`;

    let tokenInfo: any = null;
    try {
      const dbgRes = await fetch(endpoint);
      tokenInfo = await dbgRes.json();
    } catch (e: any) {
      tokenInfo = { error: e.message };
    }

    // Check assigned WABA accounts to system user
    let assignedAccounts: any = null;
    try {
      const wabaRes = await fetch(`${config.apiUrl.replace(/\/+$/, "")}/122146014128320070/assigned_whatsapp_business_accounts`, {
        headers: { "Authorization": `Bearer ${config.token}` }
      });
      assignedAccounts = await wabaRes.json();
    } catch (e: any) {
      assignedAccounts = { error: e.message };
    }

    // Attempt test message if phone is provided
    let sendResult = null;
    if (testPhone) {
      sendResult = await sendWhatsAppTextMessage({
        to: testPhone,
        text: "✨ Test message from VivaZen Salon & Spa Official WhatsApp Cloud API integration!"
      });

      // If text fails with missing template, try hello_world template
      if (!sendResult.success) {
        const tmplResult = await sendWhatsAppTemplateMessage({
          to: testPhone,
          templateName: "hello_world",
          languageCode: "en_US"
        });
        if (tmplResult.success) {
          sendResult = {
            success: true,
            messageId: tmplResult.messageId,
            note: "Sent using official Meta 'hello_world' template"
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        apiUrl: config.apiUrl,
        phoneId: config.phoneId,
        tokenPrefix: config.token ? `${config.token.substring(0, 15)}...` : "None"
      },
      tokenInfo: tokenInfo?.data || tokenInfo,
      assignedAccounts: assignedAccounts?.data || assignedAccounts,
      sendResult
    });
  } catch (err: any) {
    console.error("Error testing WhatsApp connection:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
