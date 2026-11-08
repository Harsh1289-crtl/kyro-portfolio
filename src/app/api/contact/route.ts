import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, project } = body;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    // If webhook URL is not yet configured, log to server console and simulate success
    if (!webhookUrl) {
      console.warn(
        "⚠️ DISCORD_WEBHOOK_URL is not defined in .env.local. Simulating dispatch:",
        { name, email, project }
      );
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "DISCORD_WEBHOOK_URL not configured yet. Set it in .env.local to receive live pings.",
      });
    }

    // Build formatted Discord embed
    const discordPayload = {
      username: "KyRo Transmission Bot",
      embeds: [
        {
          title: "⚡ New Project Transmission / Contact Inquiry",
          description: "A new inquiry was submitted via the contact page.",
          color: 0x38bdf8, // Cyan #38BDF8 matching the KyRo theme
          fields: [
            {
              name: "👤 Name",
              value: `**${name.trim()}**`,
              inline: true,
            },
            {
              name: "📧 Email",
              value: `[${email.trim()}](mailto:${email.trim()})`,
              inline: true,
            },
            {
              name: "📝 The Project",
              value: project?.trim()
                ? `\`\`\`\n${project.trim()}\n\`\`\``
                : "*No project details provided.*",
              inline: false,
            },
          ],
          footer: {
            text: "KyRo Portfolio • Queueing the next compile",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error("Discord Webhook Error:", discordRes.status, errText);
      return NextResponse.json(
        { error: "Failed to dispatch notification to Discord." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API handler error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing transmission." },
      { status: 500 }
    );
  }
}

