const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// Searches USDA's food database directly (not cached yet — caching happens
// in the route that calls this, once we decide what to store).
export async function searchUsdaFoods(query) {
  const url = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=10&api_key=${process.env.USDA_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USDA API error: ${response.status}`);
  }
  const data = await response.json();

  // USDA's response is verbose — pull out just what we need, and
  // normalize nutrient data (it comes as an array we have to search through).
  return data.foods.map((food) => {
    const getNutrient = (nutrientName) =>
      food.foodNutrients.find((n) => n.nutrientName === nutrientName)?.value;

    return {
      externalId: String(food.fdcId),
      name: food.description,
      caloriesPer100g: getNutrient("Energy") || 0,
      proteinPer100g: getNutrient("Protein") || 0,
      carbsPer100g: getNutrient("Carbohydrate, by difference") || 0,
      fatPer100g: getNutrient("Total lipid (fat)") || 0,
    };
  });
}