// Database setup script for user data isolation
// Run this script to ensure proper indexes for user-specific queries

import { getDb } from './mongodb';

export async function setupUserDataIndexes() {
  try {
    const db = await getDb();
    
    console.log('Setting up database indexes for user data isolation...');

    // Create indexes for weight_records collection
    await db.collection('weight_records').createIndex(
      { userId: 1, recordedAt: -1 },
      { name: 'userId_recordedAt_desc' }
    );

    // Create indexes for meal_records collection (if not already exists)
    await db.collection('meal_records').createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'userId_createdAt_desc' }
    );

    // Create indexes for calorie_records collection (if not already exists)
    await db.collection('calorie_records').createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'userId_createdAt_desc' }
    );

    // Create a general userId index for all collections
    await db.collection('weight_records').createIndex({ userId: 1 });
    await db.collection('meal_records').createIndex({ userId: 1 });
    await db.collection('calorie_records').createIndex({ userId: 1 });

    console.log('Database indexes created successfully for user data isolation');
    
    return {
      success: true,
      message: 'User data isolation indexes created successfully'
    };
  } catch (error) {
    console.error('Error setting up database indexes:', error);
    return {
      success: false,
      error: error
    };
  }
}

// Migration function to add userId to existing records (if needed)
export async function migrateExistingRecords(defaultUserId: string) {
  try {
    const db = await getDb();
    
    console.log('Migrating existing records to include userId...');

    // Update weight_records without userId
    const weightResult = await db.collection('weight_records').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUserId } }
    );

    // Update meal_records without userId (they should already have it)
    const mealResult = await db.collection('meal_records').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUserId } }
    );

    // Update calorie_records without userId (they should already have it)
    const calorieResult = await db.collection('calorie_records').updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUserId } }
    );

    console.log(`Migration completed:
      - Weight records updated: ${weightResult.modifiedCount}
      - Meal records updated: ${mealResult.modifiedCount}
      - Calorie records updated: ${calorieResult.modifiedCount}
    `);

    return {
      success: true,
      updated: {
        weight: weightResult.modifiedCount,
        meal: mealResult.modifiedCount,
        calorie: calorieResult.modifiedCount
      }
    };
  } catch (error) {
    console.error('Error migrating existing records:', error);
    return {
      success: false,
      error: error
    };
  }
}