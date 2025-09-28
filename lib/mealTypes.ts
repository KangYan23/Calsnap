export type MealType = "breakfast" | "lunch" | "dinner" | "dessert";

export interface FoodItem {
  name: string;
  estimatedCalories: number;
  confidence: number; // 0-1 confidence score
  quantity?: string; // e.g., "1 cup", "2 slices"
}

export interface MealAnalysis {
  mealType: MealType;
  foodItems: FoodItem[];
  totalCalories: number;
  analysisConfidence: number; // Overall confidence in the analysis
  imageUrl?: string; // Base64 or URL of the uploaded image
}

export interface MealRecord {
  _id?: string;
  userId?: string; // Optional - for future user authentication
  mealType: MealType;
  imageData: string; // Base64 encoded image
  analysis: MealAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealRecordInput {
  mealType: MealType;
  imageData: string; // Base64 encoded image
  analysis: MealAnalysis;
}

export interface MealRecordResponse {
  success: boolean;
  data?: MealRecord;
  error?: string;
}
