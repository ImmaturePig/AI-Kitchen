
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe, ProposalData, RecipeSuggestion } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Schemas ---

const ingredientSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the ingredient (e.g., Tomato)" },
    amount: { type: Type.STRING, description: "Quantity (e.g., 2 large, 500g)" },
    notes: { type: Type.STRING, description: "Preparation notes (e.g., diced, peeled)" },
    category: { 
      type: Type.STRING, 
      enum: ["肉类", "蔬菜", "佐料", "香料", "其他"],
      description: "Classify into: Meat/Seafood(肉类), Veg/Tofu(蔬菜), Sauces/Oil/Salt(佐料), Spices/Garlic/Ginger(香料), Others(其他)" 
    },
    conflict: {
      type: Type.BOOLEAN,
      description: "Set to TRUE if this ingredient violates the user's dietary restrictions (e.g., meat for vegetarians, chili for no-spicy)."
    }
  },
  required: ["name", "amount", "category"],
};

const stepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A very short, 2-4 character title for the step. Examples: '备菜', '腌制', '爆炒', '炖煮', '摆盘'." },
    instruction: { type: Type.STRING, description: "Detailed instruction for this step" },
    duration: { type: Type.STRING, description: "Time duration string (e.g., '10分钟', '30秒'). ONLY provide this for steps that involve active cooking (heating) or strict waiting times (marinating). DO NOT provide duration for chopping, washing, or serving." },
    tip: { type: Type.STRING, description: "A chef's secret tip for this specific step" },
  },
  required: ["title", "instruction"],
};

const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.STRING, description: "Estimated calories per serving (e.g. '350 kcal')" },
    protein: { type: Type.STRING, description: "Protein content (e.g. '20g')" },
    carbs: { type: Type.STRING, description: "Carbohydrate content (e.g. '40g')" },
    fat: { type: Type.STRING, description: "Fat content (e.g. '15g')" },
    micronutrients: {
      type: Type.OBJECT,
      properties: {
        sodium: { type: Type.STRING, description: "Sodium (mg)"},
        sugar: { type: Type.STRING, description: "Sugar (g)"},
        fiber: { type: Type.STRING, description: "Dietary Fiber (g)"},
        calcium: { type: Type.STRING, description: "Calcium (% DV or mg)"},
        iron: { type: Type.STRING, description: "Iron (% DV or mg)"},
        vitaminC: { type: Type.STRING, description: "Vitamin C (% DV or mg)"},
      }
    }
  },
};

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The name of the dish in Chinese" },
    description: { type: Type.STRING, description: "A sophisticated, appetizing short description" },
    cuisineType: { type: Type.STRING, description: "e.g., Sichuan, Cantonese, Home-style" },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    prepTime: { type: Type.STRING },
    cookTime: { type: Type.STRING },
    servings: { type: Type.STRING, description: "The number of people this recipe serves (e.g., '2人份')" },
    ingredients: { type: Type.ARRAY, items: ingredientSchema },
    steps: { type: Type.ARRAY, items: stepSchema },
    tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "General pro tips for success" },
    nutrition: nutritionSchema,
    imagePrompt: { type: Type.STRING, description: "A highly aesthetic, professional food photography prompt for this dish, studio lighting, 4k." }
  },
  required: ["title", "description", "ingredients", "steps", "difficulty", "prepTime", "cookTime", "imagePrompt", "servings", "nutrition"],
};

const proposalSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    safeOption: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING, description: "Why is this safe? e.g. 'Uses Tofu instead of Chicken'" },
        isSafe: { type: Type.BOOLEAN },
        warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
        modifications: { type: Type.STRING, description: "Instructions to generate this safe version" }
      }
    },
    originalOption: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING, description: "Description of the authentic original dish" },
        isSafe: { type: Type.BOOLEAN },
        warnings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List specific ingredients that violate restrictions e.g. 'Contains Chicken', 'Very Spicy'" },
        modifications: { type: Type.STRING, description: "Instructions to generate the original version (ignoring restrictions)" }
      }
    }
  }
};

const suggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Name of the suggested dish" },
          description: { type: Type.STRING, description: "Short appetizing description" },
          matchReason: { type: Type.STRING, description: "Why this fits the user's ingredients (e.g., 'Perfect use of your leftover rice')" },
          missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key ingredients the user needs to buy" }
        }
      }
    }
  }
};

// --- Functions ---

export const generateProposals = async (dishName: string, restrictions: string): Promise<ProposalData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User wants to cook "${dishName}" but has these restrictions: "${restrictions}".
      
      Please analyze this request and provide TWO options:
      1. safeOption: A version that STRICTLY ADHERES to the restrictions (e.g., substituting meat, removing spice).
      2. originalOption: The authentic, original version of the dish (ignoring the restrictions).
      
      For the originalOption, list specifically what makes it conflict with the restrictions in the 'warnings' array (e.g. "Contains Pork", "High Oil").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: proposalSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No proposal generated");
    
    const data = JSON.parse(text);
    return {
      originalQuery: dishName,
      safeOption: { ...data.safeOption, isSafe: true },
      originalOption: { ...data.originalOption, isSafe: false }
    };

  } catch (error) {
    console.error("Proposal generation error", error);
    throw error;
  }
};

export const suggestRecipesFromIngredients = async (ingredients: string): Promise<RecipeSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User has these ingredients: "${ingredients}".
      Suggest 3-4 distinct Chinese dishes that can be made primarily with these ingredients.
      For each suggestion, also list 1-2 key ingredients they might be missing but are standard in a kitchen.
      Ensure the dishes are appetizing and varied.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No suggestions generated");
    
    const data = JSON.parse(text);
    return data.suggestions;

  } catch (error) {
    console.error("Suggestion error", error);
    throw error;
  }
};

export const generateRecipe = async (
  dishName: string, 
  servings: number, 
  generationInstructions: string, // Specific instructions (e.g., "Use Tofu" or "Ignore restrictions")
  originalRestrictions: string // Pass original restrictions to flag conflicts
): Promise<Recipe> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a professional cooking guide for: "${dishName}". 
      
      Configuration:
      1. Servings: Scale all ingredient amounts exactly for ${servings} people.
      2. Specific Instruction: ${generationInstructions}

      Requirements:
      - Strictly categorize ingredients into: 肉类 (Meat/Seafood), 蔬菜 (Vegetables/Plant-based), 佐料 (Seasonings/Sauces), 香料 (Spices/Aromatics).
      - Ensure the language is Simplified Chinese.
      - Each step MUST have a short 2-4 character 'title' (e.g. '备菜', '焯水', '炒制').
      - For step 'duration', ONLY include it for steps that require timing (cooking/marinating). DO NOT include duration for chopping, washing, or serving.
      - Estimate Nutrition Info: Calories, Protein, Carbs, Fat.
      - Estimate Micronutrients (if applicable): Sodium, Sugar, Fiber, Vitamin C, Calcium, Iron.
      
      IMPORTANT - Conflict Detection:
      - The user has these dietary restrictions: "${originalRestrictions}".
      - Check EVERY ingredient. If an ingredient violates these restrictions (even if instructed to include it), you MUST set the 'conflict' field to true.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "You are a professional chef. You are precise. You are honest about ingredients that might violate dietary needs.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const recipeData = JSON.parse(text);
    return { ...recipeData, id: crypto.randomUUID() };
  } catch (error) {
    console.error("Recipe generation error:", error);
    throw error;
  }
};

export const generateDishImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {}
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};
