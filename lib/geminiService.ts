import { GoogleGenerativeAI } from "@google/generative-ai";
import { MealType, FoodItem, MealAnalysis } from "./mealTypes";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeFoodImage(
  imageData: string, 
  mealType: MealType
): Promise<MealAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert base64 to buffer for Gemini
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    const prompt = `
Analyze this food image for a ${mealType} meal. Please identify all food items visible and estimate their calories.

Return your analysis in the following JSON format:
{
  "foodItems": [
    {
      "name": "food item name",
      "estimatedCalories": number,
      "confidence": number (0-1),
      "quantity": "estimated portion size"
    }
  ],
  "totalCalories": number,
  "analysisConfidence": number (0-1)
}

Guidelines:
- Identify all visible food items
- Estimate calories based on typical portion sizes
- Provide confidence scores (0-1) for each item
- Include estimated portion sizes when possible
- Be conservative with calorie estimates
- Focus on the meal type context (${mealType})

Only return valid JSON, no additional text.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove any markdown formatting if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const analysis = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!analysis.foodItems || !Array.isArray(analysis.foodItems)) {
      throw new Error("Invalid response format from Gemini API");
    }
    
    if (typeof analysis.totalCalories !== 'number') {
      throw new Error("Invalid total calories in response");
    }
    
    if (typeof analysis.analysisConfidence !== 'number') {
      throw new Error("Invalid confidence score in response");
    }
    
    // Validate each food item
    const validatedFoodItems: FoodItem[] = analysis.foodItems.map((item: any) => {
      if (!item.name || typeof item.estimatedCalories !== 'number') {
        throw new Error("Invalid food item format");
      }
      
      return {
        name: item.name,
        estimatedCalories: Math.round(item.estimatedCalories),
        confidence: Math.min(Math.max(item.confidence || 0.5, 0), 1),
        quantity: item.quantity || undefined
      };
    });
    
    return {
      mealType,
      foodItems: validatedFoodItems,
      totalCalories: Math.round(analysis.totalCalories),
      analysisConfidence: Math.min(Math.max(analysis.analysisConfidence, 0), 1)
    };
    
  } catch (error) {
    console.error("Error analyzing food image:", error);
    
    // Fallback analysis if Gemini fails
    return {
      mealType,
      foodItems: [
        {
          name: "Unknown food item",
          estimatedCalories: 300,
          confidence: 0.1,
          quantity: "1 serving"
        }
      ],
      totalCalories: 300,
      analysisConfidence: 0.1
    };
  }
}
