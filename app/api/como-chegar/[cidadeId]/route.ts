import { NextRequest } from "next/server";
import { proxyToGateway } from "@/lib/apiGatewayProxy";

export const dynamic = "force-dynamic";
export const GET = (request: NextRequest) => proxyToGateway(request);
export const POST = (request: NextRequest) => proxyToGateway(request);
export const PUT = (request: NextRequest) => proxyToGateway(request);
export const PATCH = (request: NextRequest) => proxyToGateway(request);
export const DELETE = (request: NextRequest) => proxyToGateway(request);
export const OPTIONS = (request: NextRequest) => proxyToGateway(request);
export const HEAD = (request: NextRequest) => proxyToGateway(request);
