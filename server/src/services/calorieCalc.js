/**
 * Calorie-burn calculation using the MET (Metabolic Equivalent of Task) method,
 * the standard approach from exercise science literature:
 *
 *   calories_burned = MET * weight_kg * duration_hours
 *
 * Note: this is an estimate — true calorie burn varies with individual fitness
 * level, effort, and body composition. Lab equipment (VO2 max testing) is the
 * only way to get a precise number. This is the same method used under the hood
 * by most consumer fitness apps and wearables.
 */
export function calculateCaloriesBurned({ metValue, weightKg, durationMin }) {
  if (!metValue || !weightKg || !durationMin) return null;
  const durationHours = durationMin / 60;
  const calories = metValue * weightKg * durationHours;
  return Math.round(calories);
}

/**
 * Calorie calculation for a logged food quantity, using lab-tested
 * nutrition data (per 100g) from USDA FoodData Central / Open Food Facts.
 */
export function calculateMealCalories({ caloriesPer100g, quantityG }) {
  if (!caloriesPer100g || !quantityG) return null;
  return Math.round((quantityG / 100) * caloriesPer100g);
}
