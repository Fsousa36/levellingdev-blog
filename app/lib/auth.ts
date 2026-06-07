import { NextRequest } from 'next/server';

export function isAuthorized(request: NextRequest) {
  const token = process.env.ADMIN_TOKEN?.trim();

  if (!token) {
    return false;
  }

  const headerToken = request.headers.get('x-admin-token')?.trim();
  const queryToken = request.nextUrl.searchParams.get('token')?.trim();

  return headerToken === token || queryToken === token;
}
