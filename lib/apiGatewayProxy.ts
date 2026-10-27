import { NextRequest, NextResponse } from "next/server";

export async function proxyToGateway(request: NextRequest) {
  const base = process.env.API_GATEWAY_URL || "http://localhost:5000";
  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, base);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "API Gateway indisponível." }, { status: 503 });
  }
}
