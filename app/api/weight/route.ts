import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Fetch weight records for the specific user only
    const weightRecords = await db
      .collection('weight_records')
      .find({ userId: userId })
      .sort({ recordedAt: -1 })
      .limit(30) // Last 30 entries for this user
      .toArray();

    return NextResponse.json({
      success: true,
      data: weightRecords,
      count: weightRecords.length,
      userId: userId
    });
  } catch (error) {
    console.error('Error fetching weight records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weight records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookies();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { weight, notes } = await request.json();

    if (!weight || isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid weight is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    const weightRecord = {
      userId: userId, // Associate record with specific user
      weight: parseFloat(weight),
      notes: notes || '',
      recordedAt: new Date(),
      createdAt: new Date()
    };

    const result = await db.collection('weight_records').insertOne(weightRecord);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...weightRecord },
      message: 'Weight record saved successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Error saving weight record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save weight record' },
      { status: 500 }
    );
  }
}