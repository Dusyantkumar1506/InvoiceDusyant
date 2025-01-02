import prisma from "@/app/utils/db";
import requireUser from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    const { invoiceId } = await params;
    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    const sender = {
      email: "hello@demomailtrap.com",
      name: "Dusyant Kumar",
    };

    emailClient.send({
      from: sender,
      to: [{ email: "dusyantkumar1506@gmail.com" }],
      template_uuid: "12e9c5ba-6456-4890-9467-acf3625da236",
      template_variables: {
        first_name: invoiceData.clientName,
        company_info_name: "Invoice Dusyant",
        company_info_address: "kalka,chandigarh",
        company_info_city: "Kalka",
        company_info_zip_code: "133302",
        company_info_country: "India",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Faild to send an Email Reminder" },
      { status: 500 }
    );
  }
}
