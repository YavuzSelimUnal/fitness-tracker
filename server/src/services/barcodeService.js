export async function lookupBarcode(barcode) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }
  
    const data = await response.json();
  
    if (data.status !== 1 || !data.product) {
      return null;
    }
  
    const product = data.product;
    const nutriments = product.nutriments || {};
  
    return {
      externalId: barcode,
      name: product.product_name || "Unknown product",
      caloriesPer100g: nutriments["energy-kcal_100g"] || 0,
      proteinPer100g: nutriments["proteins_100g"] || 0,
      carbsPer100g: nutriments["carbohydrates_100g"] || 0,
      fatPer100g: nutriments["fat_100g"] || 0,
    };
  }