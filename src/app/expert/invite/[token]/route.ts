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

  // request.url resolves against the container's internal address on some
  // hosts (observed on Render: localhost:PORT instead of the public
  // domain) inside Route Handlers specifically — proxy.ts's request.url is
  // unaffected, but here we rebuild the origin from the forwarded-host
  // header a reverse proxy sets, which is reliably correct.
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.url;

  return NextResponse.redirect(new URL(destination, origin));
}
