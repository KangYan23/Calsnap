import { NextRequest, NextResponse } from 'next/server';
import { setupUserDataIndexes, migrateExistingRecords } from '@/lib/dbSetup';

export async function POST(request: NextRequest) {
  try {
    const { action, defaultUserId } = await request.json();

    if (action === 'setup-indexes') {
      const result = await setupUserDataIndexes();
      return NextResponse.json(result);
    }

    if (action === 'migrate-records' && defaultUserId) {
      const result = await migrateExistingRecords(defaultUserId);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Database setup failed' },
      { status: 500 }
    );
  }
}