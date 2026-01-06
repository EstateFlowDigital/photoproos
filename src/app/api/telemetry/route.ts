import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Keep this lightweight: just log to stdout for now. In production, pipe to a real sink.
    console.info("[telemetry]", {
      route: req.headers.get("x-ppos-route") || req.nextUrl.pathname,
      ua: req.headers.get("user-agent"),
      payload: body,
    });
  } catch (err) {
    console.warn("[telemetry] failed to parse payload", err);
  }

  return new Response(null, { status: 204 });
}
