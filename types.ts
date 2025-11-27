
export interface Ingredient {
  name: string;
  amount: string;
  notes?: string;
  category?: string;
  conflict?: boolean; // New: true if this ingredient violates user restrictions
}

export interface Step {
  title: string; // Short title, e.g. "切菜", "炒制"
  instruction: string;
  duration?: string;
  tip?: string;
}

export interface Micronutrients {
  sodium?: string; // e.g. "500mg"
  sugar?: string; // e.g. "5g"
  fiber?: string; // e.g. "3g"
  calcium?: string; // e.g. "10%"
  iron?: string; // e.g. "5%"
  vitaminC?: string;
}

export interface NutritionInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  micronutrients?: Micronutrients; // New field
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisineType: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: Ingredient[];
  steps: Step[];
  tips: string[];
  nutrition: NutritionInfo;
  imagePrompt?: string; 
  imageUrl?: string; // Static image URL to avoid generation
}

export interface GeneratedImage {
  url: string;
}

export interface ProposalOption {
  title: string;
  description: string;
  isSafe: boolean; // true for modified/safe version, false for original
  warnings: string[]; // e.g. "Contains Meat", "Very Spicy"
  modifications: string; // Internal instruction for the AI generation
}

export interface ProposalData {
  originalQuery: string;
  safeOption: ProposalOption;
  originalOption: ProposalOption;
}

export interface RecipeSuggestion {
  title: string;
  description: string;
  matchReason: string; // e.g. "Uses your Tomato and Eggs"
  missingIngredients: string[]; // e.g. "Green onions"
}

export interface CookedLog {
  id: string;
  recipeTitle: string;
  date: string; // ISO string
  nutrition: NutritionInfo;
  consumedServings: number; // The actual amount eaten
}

export type UnitType = '个' | 'g' | 'kg' | 'ml' | 'L' | '根' | '包' | '勺' | '适量';

export type SearchMode = 'dish' | 'ingredient';

export interface HistoryItem {
  query: string;
  mode: SearchMode;
}

export enum AppState {
  HOME,
  LOADING,
  PROPOSAL_VIEW, 
  RECIPE_VIEW,
  CART_VIEW,
  FAVORITES_VIEW,
  FRIDGE_VIEW, 
  SUGGESTION_SELECT_VIEW, 
  DASHBOARD_VIEW, // New view
  ERROR
}
