import { NextResponse } from 'next/server';
import { getDatabaseHealth } from '../../../lib/db';

export async function GET() {
  const database = await getDatabaseHealth();

  return NextResponse.json({
    adminTokenConfigured: Boolean(process.env.ADMIN_TOKEN),
    databaseConfigured: database.configured,
    databaseReachable: database.reachable,
    databaseError: database.error
  });
}
