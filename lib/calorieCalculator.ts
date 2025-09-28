export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface CalorieCalculationInput {
  sex: Sex;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
}

export interface CalorieCalculationResult {
  bmr: number;
  tdee: number;
  maxCalories: number;
}

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
 * BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + sex factor
 * 
 * @param sex - "male" or "female"
 * @param age - Age in years
 * @param height - Height in centimeters
 * @param weight - Weight in kilograms
 * @returns BMR in calories per day
 */
function calculateBMR(sex: Sex, age: number, height: number, weight: number): number {
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
  const sexFactor = sex === "male" ? 5 : -161;
  return baseBMR + sexFactor;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure) by multiplying BMR with activity multiplier
 * 
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level from sedentary to very active
 * @returns TDEE in calories per day
 */
function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Calculate calories based on user's physical characteristics and activity level
 * 
 * @param input - User's sex, age, height, weight, and activity level
 * @returns Object containing BMR, TDEE, and maxCalories (which equals TDEE)
 */
export function calculateCalories(input: CalorieCalculationInput): CalorieCalculationResult {
  const { sex, age, height, weight, activityLevel } = input;
  
  // Validate inputs
  if (age <= 0 || height <= 0 || weight <= 0) {
    throw new Error("Age, height, and weight must be positive numbers");
  }
  
  if (age > 120) {
    throw new Error("Age must be reasonable (≤ 120 years)");
  }
  
  if (height < 100 || height > 250) {
    throw new Error("Height must be between 100-250 cm");
  }
  
  if (weight < 20 || weight > 300) {
    throw new Error("Weight must be between 20-300 kg");
  }
  
  // Calculate BMR using Mifflin-St Jeor Equation
  const bmr = calculateBMR(sex, age, height, weight);
  
  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maxCalories: Math.round(tdee), // TDEE is the maximum calories they can eat per day
  };
}
