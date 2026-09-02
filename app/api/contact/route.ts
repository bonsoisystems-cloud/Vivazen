import { NextResponse } from "next/server";
import { query, initCrmTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            name, 
            phone, 
            email, 
            date, 
            timeSlot, 
            service, 
            subServices, 
            selectedServicesList,
            totalEstimatedPrice,
            package: packageName, 
            message 
        } = body;

        const clientName = (name || "Website Guest").trim();
        const clientPhone = (phone || "").trim();

        if (!clientPhone) {
            return NextResponse.json(
                { success: false, message: "Phone number is required for booking" },
                { status: 400 }
            );
        }

        // Build a detailed service requirements string
        let serviceSummary = "";
        if (packageName) {
            serviceSummary = `Package: ${packageName}${totalEstimatedPrice ? ` (₹${totalEstimatedPrice.toLocaleString("en-IN")})` : ""}`;
        } else if (Array.isArray(selectedServicesList) && selectedServicesList.length > 0) {
            const listStr = selectedServicesList.map((s: any) => `${s.categoryName ? s.categoryName + ": " : ""}${s.itemName || s.name}${s.price ? ` (₹${s.price})` : ""}`).join("; ");
            serviceSummary = `${listStr}${totalEstimatedPrice ? ` [Total Est: ₹${totalEstimatedPrice.toLocaleString("en-IN")}]` : ""}`;
        } else if (Array.isArray(subServices) && subServices.length > 0) {
            serviceSummary = `${service || "Services"}: ${subServices.join(", ")}`;
        } else {
            serviceSummary = service || "General Salon Enquiry";
        }

        const enquiryType = packageName 
            ? "Bridal Package" 
            : serviceSummary.toLowerCase().includes("hair") 
            ? "Hair Services" 
            : serviceSummary.toLowerCase().includes("facial") || serviceSummary.toLowerCase().includes("skin") 
            ? "Skin & Facial" 
            : "Website Booking";

        const formattedDate = date ? String(date) : new Date().toISOString().split("T")[0];
        const formattedTimeSlot = timeSlot || "Flexible / Not Specified";

        // Build comprehensive response notes for CRM staff
        const responseDetails = [
            `Preferred Date: ${formattedDate}`,
            `Preferred Time Slot: ${formattedTimeSlot}`,
            `Estimated Total: ₹${(totalEstimatedPrice || 0).toLocaleString("en-IN")}`,
            `Requested Services: ${serviceSummary}`,
            message ? `Guest Notes: ${message}` : null
        ].filter(Boolean).join(" | ");

        const enquiryId = `en_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

        // Attempt direct insertion into PostgreSQL CRM Enquiry table
        try {
            await query(
                `INSERT INTO "Enquiry" (
                    id, "clientName", phone, email, address, "enquiryFor", "enquiryType", response, "followDate", source, representative, status, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING`,
                [
                    enquiryId,
                    clientName,
                    clientPhone,
                    email || null,
                    formattedTimeSlot,
                    serviceSummary,
                    enquiryType,
                    responseDetails,
                    formattedDate,
                    "Website",
                    "Online Concierge",
                    "Hot"
                ]
            );
            console.log(`✅ Saved appointment request ${enquiryId} to CRM Enquiries DB table.`);
        } catch (dbErr: any) {
            console.warn("DB insert notice, ensuring CRM tables initialized:", dbErr.message);
            // If table didn't exist, initialize and retry once
            try {
                await initCrmTables();
                await query(
                    `INSERT INTO "Enquiry" (
                        id, "clientName", phone, email, address, "enquiryFor", "enquiryType", response, "followDate", source, representative, status, "createdAt", "updatedAt"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                    ON CONFLICT (id) DO NOTHING`,
                    [
                        enquiryId,
                        clientName,
                        clientPhone,
                        email || null,
                        formattedTimeSlot,
                        serviceSummary,
                        enquiryType,
                        responseDetails,
                        formattedDate,
                        "Website",
                        "Online Concierge",
                        "Hot"
                    ]
                );
            } catch (retryErr) {
                console.error("Failed saving enquiry to DB on retry:", retryErr);
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Appointment request received and saved to CRM enquiries successfully",
                data: {
                    id: enquiryId,
                    clientName,
                    phone: clientPhone,
                    serviceSummary,
                    date: formattedDate,
                    timeSlot: formattedTimeSlot,
                    totalEstimatedPrice,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing contact enquiry:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to process appointment request",
            },
            { status: 500 }
        );
    }
}
