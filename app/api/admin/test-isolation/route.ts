import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testUserId = searchParams.get('userId') || 'test-user-123';

    const db = await getDb();
    
    // Test data isolation for all collections
    const results = {
      weightRecords: {
        userSpecific: 0,
        total: 0,
        isolation: false
      },
      mealRecords: {
        userSpecific: 0,
        total: 0,
        isolation: false
      },
      calorieRecords: {
        userSpecific: 0,
        total: 0,
        isolation: false
      }
    };

    // Test weight records isolation
    const totalWeightRecords = await db.collection('weight_records').countDocuments({});
    const userWeightRecords = await db.collection('weight_records').countDocuments({ userId: testUserId });
    
    results.weightRecords = {
      userSpecific: userWeightRecords,
      total: totalWeightRecords,
      isolation: userWeightRecords < totalWeightRecords || (totalWeightRecords === 0 && userWeightRecords === 0)
    };

    // Test meal records isolation
    const totalMealRecords = await db.collection('meal_records').countDocuments({});
    const userMealRecords = await db.collection('meal_records').countDocuments({ userId: testUserId });
    
    results.mealRecords = {
      userSpecific: userMealRecords,
      total: totalMealRecords,
      isolation: userMealRecords < totalMealRecords || (totalMealRecords === 0 && userMealRecords === 0)
    };

    // Test calorie records isolation
    const totalCalorieRecords = await db.collection('calorie_records').countDocuments({});
    const userCalorieRecords = await db.collection('calorie_records').countDocuments({ userId: testUserId });
    
    results.calorieRecords = {
      userSpecific: userCalorieRecords,
      total: totalCalorieRecords,
      isolation: userCalorieRecords < totalCalorieRecords || (totalCalorieRecords === 0 && userCalorieRecords === 0)
    };

    // Check if all records have userId field
    const recordsWithoutUserId = {
      weight: await db.collection('weight_records').countDocuments({ userId: { $exists: false } }),
      meal: await db.collection('meal_records').countDocuments({ userId: { $exists: false } }),
      calorie: await db.collection('calorie_records').countDocuments({ userId: { $exists: false } })
    };

    const overallIsolation = 
      results.weightRecords.isolation && 
      results.mealRecords.isolation && 
      results.calorieRecords.isolation &&
      recordsWithoutUserId.weight === 0 &&
      recordsWithoutUserId.meal === 0 &&
      recordsWithoutUserId.calorie === 0;

    return NextResponse.json({
      success: true,
      testUserId,
      results,
      recordsWithoutUserId,
      overallIsolation,
      summary: {
        status: overallIsolation ? 'PASS' : 'FAIL',
        message: overallIsolation 
          ? 'User data isolation is properly implemented'
          : 'User data isolation needs attention - some records may be missing userId or cross-contamination detected'
      }
    });

  } catch (error) {
    console.error('Error testing data isolation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test data isolation' },
      { status: 500 }
    );
  }
}