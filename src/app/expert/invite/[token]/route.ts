import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginWithInviteToken } from "../../actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const result = await loginWithInviteToken(token);

  const destination = result.ok
    ? result.profileComplete
      ? "/expert/review"
      : "/expert/profile"
    : "/expert?error=invalid_invite";

  return NextResponse.redirect(new URL(destination, request.url));
}
