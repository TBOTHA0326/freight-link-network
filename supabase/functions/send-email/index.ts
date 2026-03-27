import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailPayload = await req.json();

    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: Number(Deno.env.get("SMTP_PORT") ?? 587),
      secure: Number(Deno.env.get("SMTP_PORT") ?? 587) === 465,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    const info = await transporter.sendMail({
      from: Deno.env.get("SMTP_FROM") ?? "Freight Link Network <onboarding@f-ln.co.za>",
      to,
      subject,
      html,
    });

    console.log("sendMail result:", JSON.stringify({
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    }));

    return new Response(JSON.stringify({ success: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
