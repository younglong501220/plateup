import { GameItem, ItemType } from './types';

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  requiredIngredients: ItemType[];
}

export const RECIPES: Record<string, Recipe> = {
  burger: {
    id: 'burger',
    name: '經典肉排堡',
    icon: '🍔',
    price: 22,
    description: '圓麵包 + 香煎熟肉排 + 乾淨餐盤',
    requiredIngredients: ['bun', 'cooked_meat'],
  },
  cheeseburger: {
    id: 'cheeseburger',
    name: '濃郁起司堡',
    icon: '🧀🍔',
    price: 35,
    description: '圓麵包 + 香煎熟肉排 + 切片起司 + 乾淨餐盤',
    requiredIngredients: ['bun', 'cooked_meat', 'sliced_cheese'],
  },
  salad: {
    id: 'salad',
    name: '田園鮮蔬沙拉',
    icon: '🥗',
    price: 28,
    description: '切片生菜 + 切片番茄 + 乾淨餐盤（無需開火，純刀工組裝）',
    requiredIngredients: ['sliced_lettuce', 'sliced_tomato'],
  },
  steak: {
    id: 'steak',
    name: '頂級香煎牛排',
    icon: '🥩🍽️',
    price: 42,
    description: '香煎熟牛排 + 炙燒切片番茄佐餐 + 乾淨餐盤',
    requiredIngredients: ['cooked_meat', 'sliced_tomato'],
  },
  deluxe_burger: {
    id: 'deluxe_burger',
    name: '豪華總匯巨堡',
    icon: '👑🍔',
    price: 55,
    description: '圓麵包 + 香煎熟肉排 + 起司片 + 生菜片 + 番茄片 + 乾淨餐盤',
    requiredIngredients: ['bun', 'cooked_meat', 'sliced_cheese', 'sliced_lettuce', 'sliced_tomato'],
  },
};

/**
 * Checks if a plate matches a given recipe order
 */
export function doesPlateMatchRecipe(plate: GameItem, recipeId: string): boolean {
  if (plate.type !== 'plate' || !plate.contents) return false;
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;

  const contents = [...plate.contents].sort();
  const required = [...recipe.requiredIngredients].sort();

  if (contents.length !== required.length) return false;

  for (let i = 0; i < contents.length; i++) {
    if (contents[i] !== required[i]) return false;
  }
  return true;
}

/**
 * Describe contents of a plate in human friendly format
 */
export function getPlateDescription(plate: GameItem): string {
  if (plate.type !== 'plate') return '';
  const c = plate.contents || [];
  if (c.length === 0) return '空盤子';
  if (doesPlateMatchRecipe(plate, 'deluxe_burger')) return '豪華總匯巨堡 👑🍔';
  if (doesPlateMatchRecipe(plate, 'steak')) return '頂級香煎牛排 🥩';
  if (doesPlateMatchRecipe(plate, 'salad')) return '田園鮮蔬沙拉 🥗';
  if (doesPlateMatchRecipe(plate, 'cheeseburger')) return '起司漢堡 🧀🍔';
  if (doesPlateMatchRecipe(plate, 'burger')) return '經典漢堡 🍔';
  
  const names = c.map(item => {
    switch (item) {
      case 'bun': return '麵包';
      case 'cooked_meat': return '熟肉排';
      case 'sliced_cheese': return '起司片';
      case 'raw_meat': return '生肉排';
      case 'sliced_lettuce': return '生菜葉';
      case 'sliced_tomato': return '番茄片';
      default: return item;
    }
  });
  return `盤裝: ${names.join('+')}`;
}
