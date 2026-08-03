import { describe, it, expect } from "vitest";
import { calculateCaloriesBurned, calculateMealCalories } from "./calorieCalc.js";

describe("calculateCaloriesBurned", () => {
  it("calculates calories using the MET formula correctly", () => {
    // 9.8 MET (running) * 70kg * 0.5 hours (30 min) = 343
    const result = calculateCaloriesBurned({ metValue: 9.8, weightKg: 70, durationMin: 30 });
    expect(result).toBe(343);
  });

  it("returns null if any required value is missing", () => {
    expect(calculateCaloriesBurned({ metValue: null, weightKg: 70, durationMin: 30 })).toBeNull();
    expect(calculateCaloriesBurned({ metValue: 9.8, weightKg: null, durationMin: 30 })).toBeNull();
    expect(calculateCaloriesBurned({ metValue: 9.8, weightKg: 70, durationMin: null })).toBeNull();
  });

  it("rounds the result to a whole number", () => {
    const result = calculateCaloriesBurned({ metValue: 6, weightKg: 68, durationMin: 45 });
    // 6 * 68 * 0.75 = 306
    expect(result).toBe(306);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe("calculateMealCalories", () => {
  it("scales calories proportionally to quantity", () => {
    // 165 kcal per 100g, eating 150g = 247.5, rounded to 248
    const result = calculateMealCalories({ caloriesPer100g: 165, quantityG: 150 });
    expect(result).toBe(248);
  });

  it("returns null if calories or quantity are missing", () => {
    expect(calculateMealCalories({ caloriesPer100g: null, quantityG: 150 })).toBeNull();
    expect(calculateMealCalories({ caloriesPer100g: 165, quantityG: null })).toBeNull();
  });

  it("handles small quantities correctly", () => {
    const result = calculateMealCalories({ caloriesPer100g: 500, quantityG: 10 });
    expect(result).toBe(50);
  });
});