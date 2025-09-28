import { CalorieCalculationInput, CalorieCalculationResult } from "./calorieCalculator";

export interface CalorieRecord {
  _id?: string;
  userId?: string; // Optional - can be added later for user authentication
  input: CalorieCalculationInput;
  result: CalorieCalculationResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalorieRecordInput {
  input: CalorieCalculationInput;
  result: CalorieCalculationResult;
}

export interface CalorieRecordResponse {
  success: boolean;
  data?: CalorieRecord;
  error?: string;
}
