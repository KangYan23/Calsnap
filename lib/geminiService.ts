import { GoogleGenerativeAI } from "@google/generative-ai";
import { MealType, FoodItem, MealAnalysis } from "./mealTypes";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Cache for discovered models to avoid repeated API calls
let cachedVisionModel: any = null;

// Helper: Call the REST API to list available models and find one that supports generateContent
async function discoverVisionCapableModel(): Promise<any> {
  if (cachedVisionModel) {
    return cachedVisionModel;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Call Google's REST API to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`ListModels API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));

    if (data.models && Array.isArray(data.models)) {
      // Look for models that support generateContent
      for (const model of data.models) {
        const modelName = model.name;
        const supportedMethods = model.supportedGenerationMethods || [];
        
        console.log(`Model: ${modelName}, Methods: ${supportedMethods.join(', ')}`);
        
        // Check if this model supports generateContent
        if (supportedMethods.includes('generateContent')) {
          try {
            // Extract just the model ID from the full name (e.g., "models/gemini-pro" -> "gemini-pro")
            const modelId = modelName.replace('models/', '');
            console.log(`Trying to use model: ${modelId}`);
            
            const testModel = genAI.getGenerativeModel({ model: modelId });
            cachedVisionModel = testModel;
            console.log(`Successfully selected model: ${modelId}`);
            return testModel;
          } catch (e) {
            console.warn(`Failed to create model ${modelName}:`, e);
            continue;
          }
        }
      }
    }

    throw new Error("No models found that support generateContent in your region");
  } catch (error) {
    console.error("Error discovering vision-capable model:", error);
    throw error;
  }
}

export async function analyzeFoodImage(
  imageData: string, 
  mealType: MealType
): Promise<MealAnalysis> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // First, discover what models are actually available
    console.log("Discovering available Gemini models...");
    const model = await discoverVisionCapableModel();

    // Convert base64 to buffer for Gemini
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Extract MIME type from data URL
    const mimeTypeMatch = imageData.match(/data:([^;]+);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    
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

    console.log("Calling Gemini API with discovered model...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("Raw Gemini response:", text);
    
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
    
    console.log("Successfully parsed Gemini response:", {
      totalCalories: Math.round(analysis.totalCalories),
      foodItemsCount: validatedFoodItems.length,
      confidence: analysis.analysisConfidence
    });
    
    return {
      mealType,
      foodItems: validatedFoodItems,
      totalCalories: Math.round(analysis.totalCalories),
      analysisConfidence: Math.min(Math.max(analysis.analysisConfidence, 0), 1)
    };
    
  } catch (error) {
    console.error("Error analyzing food image:", error);
    
    // Provide more specific error information for debugging
    if (error instanceof Error) {
      // Check for specific API errors
      if (error.message.includes('404')) {
        throw new Error(`Gemini API model not found or does not support generateContent. This may indicate no suitable models are available in your region. Original error: ${error.message}`);
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error(`Gemini API authentication failed. Please check your GEMINI_API_KEY. Original error: ${error.message}`);
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error(`Gemini API quota exceeded. Original error: ${error.message}`);
      }
      throw new Error(`Failed to analyze food image: ${error.message}`);
    }
    
    throw new Error(`Failed to analyze food image: Unknown error occurred`);
  }
}
