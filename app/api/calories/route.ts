import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { CalorieRecordInput, CalorieRecordResponse } from "@/lib/types";
import { getUserIdFromCookies } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body: CalorieRecordInput = await request.json();
    const { input, result } = body;

    // Validate required fields
    if (!input || !result) {
      return NextResponse.json(
        { success: false, error: "Input and result are required" },
        { status: 400 }
      );
    }

    // Validate input fields
    if (!input.sex || !input.activityLevel || !input.age || !input.height || !input.weight) {
      return NextResponse.json(
        { success: false, error: "All input fields are required" },
        { status: 400 }
      );
    }

    // Validate result fields
    if (!result.bmr || !result.tdee || !result.maxCalories) {
      return NextResponse.json(
        { success: false, error: "All result fields are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const caloriesCollection = db.collection("calorie_records");

    // Create the record with timestamps
    const now = new Date();
    const calorieRecord = {
      userId,
      input,
      result,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the record
    const insertResult = await caloriesCollection.insertOne(calorieRecord);

    if (!insertResult.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to save calorie record" },
        { status: 500 }
      );
    }

    // Return the created record with the generated ID
    const createdRecord = {
      _id: insertResult.insertedId.toString(),
      ...calorieRecord,
    };

    const response: CalorieRecordResponse = {
      success: true,
      data: createdRecord,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error saving calorie record:", error);
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

    const db = await getDb();
    const caloriesCollection = db.collection("calorie_records");

    // Get records sorted by creation date (newest first)
    const records = await caloriesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Convert ObjectId to string for JSON serialization
    const formattedRecords = records.map(record => {
      const { _id, ...rest } = record as any;
      return {
        _id: _id.toString(),
        ...rest,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedRecords,
      count: formattedRecords.length,
    });
  } catch (error) {
    console.error("Error fetching calorie records:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
