import { NextResponse } from 'next/server';
import { hasDatabase } from '../../../lib/db';

export async function GET() {
  return NextResponse.json({
    adminTokenConfigured: Boolean(process.env.ADMIN_TOKEN),
    databaseConfigured: hasDatabase()
  });
}
