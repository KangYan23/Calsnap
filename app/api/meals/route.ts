import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { analyzeFoodImage } from "@/lib/geminiService";
import { MealRecordInput, MealRecordResponse, MealType } from "@/lib/mealTypes";
import { getUserIdFromCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mealType, imageData } = body;

    // Validate required fields
    if (!mealType || !imageData) {
      return NextResponse.json(
        { success: false, error: "Meal type and image data are required" },
        { status: 400 }
      );
    }

    // Validate meal type
    const validMealTypes: MealType[] = ["breakfast", "lunch", "dinner", "dessert"];
    if (!validMealTypes.includes(mealType)) {
      return NextResponse.json(
        { success: false, error: "Invalid meal type" },
        { status: 400 }
      );
    }

    // Validate image data format
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: "Invalid image format" },
        { status: 400 }
      );
    }

    // Analyze the image with Gemini AI
    const analysis = await analyzeFoodImage(imageData, mealType);

    const db = await getDb();
    const mealsCollection = db.collection("meal_records");

    // Create the record with timestamps
    const now = new Date();
    const mealRecord = {
      userId,
      mealType,
      imageData,
      analysis,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the record
    const insertResult = await mealsCollection.insertOne(mealRecord);

    if (!insertResult.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to save meal record" },
        { status: 500 }
      );
    }

    // Return the created record with the generated ID
    const createdRecord = {
      _id: insertResult.insertedId.toString(),
      ...mealRecord,
    };

    const response: MealRecordResponse = {
      success: true,
      data: createdRecord,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error saving meal record:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const mealType = searchParams.get("mealType");

    const db = await getDb();
    const mealsCollection = db.collection("meal_records");

    // Build query
    const query = mealType ? { userId, mealType } : { userId };

    // Get records sorted by creation date (newest first)
    const records = await mealsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const formattedRecords = records.map(record => ({
      _id: record._id.toString(),
      mealType: record.mealType,
      analysis: record.analysis,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      // Don't include imageData in GET response to reduce payload size
    }));

    return NextResponse.json({
      success: true,
      data: formattedRecords,
      count: formattedRecords.length,
    });
  } catch (error) {
    console.error("Error fetching meal records:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
