// localhost3000/api/invoice/hello thats how this route look like ;)

import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";
import { formatCurrency } from "@/app/utils/formatCurrency";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;
  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceNumber: true,
      invoiceName: true,
      currency: true,
      fromEmail: true,
      fromName: true,
      fromAddress: true,
      clientName: true,
      clientEmail: true,
      clientAddress: true,
      date: true,
      dueDate: true,
      invoiceItemDescription: true,
      invoiceItemQuantity: true,
      invoiceItemRate: true,
      total: true,
      note: true,
    },
  });

  if (!data) {
    return NextResponse.json({ error: "invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFont("helvetika");
  pdf.setFontSize(24);
  pdf.text(data.invoiceName, 20, 20);

  //   from section pdf
  pdf.setFontSize(12);
  pdf.text("From", 20, 40);
  pdf.setFontSize(10);
  pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

  //   client section pdf
  pdf.setFontSize(12);
  pdf.text("Bill to", 20, 70);
  pdf.setFontSize(10);
  pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

  //   invoice details
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: ${data.invoiceNumber}`, 120, 40);
  pdf.text(
    `Date: ${new Intl.DateTimeFormat("en-US", {
      dateStyle: "long",
    }).format(data.date)}`,
    120,
    45
  );
  pdf.text(`Due Date: ${data.dueDate}`, 120, 50);

  //   item table header of pdf
  pdf.setFontSize(10);
  pdf.setFont("helvetika", "bold");
  pdf.text("Description", 20, 100);
  pdf.text("Quantity", 100, 100);
  pdf.text("Rate", 130, 100);
  pdf.text("Total", 160, 100);

  //   draw header lines for table
  pdf.line(20, 102, 190, 102);

  //   item details
  pdf.setFont("helvetika", "normal");
  pdf.text(data.invoiceItemDescription, 20, 110);
  pdf.text(data.invoiceItemQuantity.toString(), 100, 110);
  pdf.text(
    formatCurrency({
      amount: data.invoiceItemRate,
      currency: data.currency as any,
    }),
    130,
    110
  );
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as any,
    }),
    160,
    110
  );

  //   total section
  pdf.line(20, 115, 190, 115);
  pdf.setFont("helvetika", "bold");
  pdf.text(`Total (${data.currency})`, 130, 130);
  pdf.text(
    formatCurrency({
      amount: data.total,
      currency: data.currency as any,
    }),
    160,
    130
  );

  //   additional note
  if (data.note) {
    pdf.setFont("helvetika", "normal");
    pdf.setFontSize(10);
    pdf.text("Note:", 20, 150);
    pdf.text(data.note, 20, 155);
  }

  //   generate pdf as buffer code
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  //   generate pdf and download it
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
