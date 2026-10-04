import type { NextRequest } from "next/server";
import { proxyBattutaCommunity } from "@/lib/battuta-community-proxy";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  return proxyBattutaCommunity(request);
}
