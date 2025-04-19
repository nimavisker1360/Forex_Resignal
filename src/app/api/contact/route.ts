import { NextResponse } from "next/server";
import { Resend } from "resend";

// Create a new Resend instance using the API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple validation helper
function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// This function handles POST requests to /api/contact
export async function POST(request: Request) {
  try {
    // Check request origin
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      "http://localhost:3000",
    ];

    console.log("Request origin:", origin);
    console.log("Allowed origins:", allowedOrigins);
    console.log("Email config:", {
      resendApiKey: process.env.RESEND_API_KEY ? "Set" : "Not set",
    });

    // Temporarily disable origin check during testing
    /* 
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: "Unauthorized request origin" },
        { status: 403 }
      );
    }
    */

    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message } = body;
    console.log("Form data received:", {
      name,
      email,
      subject,
      messageLength: message?.length,
    });

    // Enhanced validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message is too short" },
        { status: 400 }
      );
    }

    // If no Resend API key is provided, simulate success during development
    if (!process.env.RESEND_API_KEY) {
      console.log(
        "No RESEND_API_KEY found. In development mode, simulating success."
      );
      console.log("Email would have been sent with:", { name, email, subject });

      return NextResponse.json(
        {
          message:
            "Your message has been sent successfully! (Development mode)",
        },
        { status: 200 }
      );
    }

    try {
      // Send email using Resend
      const data = await resend.emails.send({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["nimabaghery@gmail.com"],
        subject: `Contact Form: ${subject}`,
        reply_to: email,
        text: `
          Name: ${name}
          Email: ${email}
          
          Message:
          ${message}
        `,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });

      console.log("Email sent successfully with Resend:", data);

      return NextResponse.json(
        { message: "Your message has been sent successfully!" },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Email sending error details:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send email. Please check your email configuration.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
