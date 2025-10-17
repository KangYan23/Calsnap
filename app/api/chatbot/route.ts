import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let userMessage = '';
  
  try {
    const body = await request.json();
    const { message } = body;
    userMessage = message || '';

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return getFallbackResponse(userMessage);
    }

    // Create a fitness-focused system prompt
    const systemPrompt = `You are the CalSnap AI assistant, a knowledgeable and friendly AI fitness assistant for the CalSnap fitness tracking app. 

Your expertise includes:
- Weight management and tracking
- Calorie counting and nutrition
- TDEE (Total Daily Energy Expenditure) calculations
- General fitness tips and motivation
- Meal planning and healthy eating habits
- Exercise recommendations

Key guidelines:
- Keep responses conversational, encouraging, and supportive
- Provide practical, actionable advice
- Be concise but informative (aim for 2-4 sentences)
- If asked about specific medical concerns, recommend consulting healthcare professionals
- Focus on sustainable, healthy habits
- Use a positive, motivational tone
- Remember you're part of the CalSnap app ecosystem

User context: The user is using the CalSnap fitness dashboard that tracks weight, calories, meals, and calculates TDEE. They may ask about their progress, get explanations about fitness concepts, or seek advice.

User question: ${message}`;

    console.log('Sending request to Gemini API...');

    // Use Gemini API for responses
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      }),
    });

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return getFallbackResponse(userMessage);
    }

    const data = await geminiResponse.json();
    console.log('Gemini API response:', data);
    
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botResponse) {
      console.error('No response generated from Gemini');
      return getFallbackResponse(userMessage);
    }

    return NextResponse.json({
      response: botResponse,
      success: true
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(message: string) {
  const lowerMessage = message.toLowerCase();
  let fallbackResponse = "I'm your CalSnap AI assistant! I can help you with weight tracking, calories, TDEE, and fitness tips. What would you like to know?";

  if (lowerMessage.includes('weight')) {
    fallbackResponse = "Weight fluctuations are completely normal! 🏋️‍♀️ Factors like hydration, meal timing, sodium intake, and even the time of day can affect your weight. Focus on the overall trend over weeks rather than daily changes. Keep tracking consistently with CalSnap - you're doing great!";
  } else if (lowerMessage.includes('calorie') || lowerMessage.includes('tdee')) {
    fallbackResponse = "TDEE (Total Daily Energy Expenditure) is the total calories you burn in a day! 🔥 It includes your basal metabolic rate (calories at rest) plus calories from daily activities and exercise. Eating around your TDEE maintains weight, eating below helps with weight loss. Your CalSnap dashboard calculates this for you!";
  } else if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    fallbackResponse = "For healthy meals, aim for the 'plate method': 🍽️ Fill half your plate with vegetables, one quarter with lean protein, and one quarter with complex carbs. Include healthy fats like avocado or nuts. Stay hydrated and try to eat at regular times for steady energy! Use CalSnap's meal analysis to track your nutrition.";
  } else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
    fallbackResponse = "Exercise is amazing for both body and mind! 💪 Start with activities you enjoy and gradually increase intensity. Aim for 150 minutes of moderate exercise weekly, plus 2 days of strength training. Remember: consistency beats perfection!";
  } else if (lowerMessage.includes('progress') || lowerMessage.includes('goal')) {
    fallbackResponse = "Progress isn't always linear - and that's okay! 📈 Celebrate small victories, track multiple metrics (not just weight), take progress photos, and notice how you feel. Your CalSnap dashboard helps you see patterns over time. Keep going!";
  } else if (lowerMessage.includes('motivation') || lowerMessage.includes('help')) {
    fallbackResponse = "You're already taking the right steps by using CalSnap to track your health! 🌟 Remember, every healthy choice matters. Small, consistent actions lead to big results. Focus on progress, not perfection. I'm here to support your fitness journey!";
  }

  return NextResponse.json({
    response: fallbackResponse,
    success: false,
    fallback: true
  });
}