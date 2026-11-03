import { NextResponse } from "next/server";

export async function GET() {
  // Redirect to official APK release
  return NextResponse.redirect("https://github.com/hamzaovet/elshafie/releases", 302);
}
