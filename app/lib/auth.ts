import { NextRequest } from 'next/server';

export function isAuthorized(request: NextRequest) {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    return false;
  }

  const headerToken = request.headers.get('x-admin-token');
  const queryToken = request.nextUrl.searchParams.get('token');

  return headerToken === token || queryToken === token;
}
