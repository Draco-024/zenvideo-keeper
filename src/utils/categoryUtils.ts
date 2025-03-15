
import { CategorySettings, DEFAULT_CATEGORIES } from '@/types/video';

// Get all categories from localStorage or use defaults
export const getCategories = (): CategorySettings[] => {
  const storedCategories = localStorage.getItem('bankzen_categories');
  if (storedCategories) {
    return JSON.parse(storedCategories);
  }
  
  // Initialize with default categories if none exist
  saveCategories(DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
};

// Save categories to localStorage
export const saveCategories = (categories: CategorySettings[]): void => {
  localStorage.setItem('bankzen_categories', JSON.stringify(categories));
};

// Add a new category
export const addCategory = (name: string): CategorySettings[] => {
  const categories = getCategories();
  const newCategory: CategorySettings = {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    order: categories.length
  };
  
  categories.push(newCategory);
  saveCategories(categories);
  return categories;
};

// Update a category
export const updateCategory = (id: string, updates: Partial<Omit<CategorySettings, 'id'>>): CategorySettings[] => {
  const categories = getCategories();
  const updatedCategories = categories.map(category => 
    category.id === id ? { ...category, ...updates } : category
  );
  
  saveCategories(updatedCategories);
  return updatedCategories;
};

// Delete a category
export const deleteCategory = (id: string): CategorySettings[] => {
  const categories = getCategories().filter(category => category.id !== id);
  saveCategories(categories);
  return categories;
};

// Reorder categories
export const reorderCategories = (categories: CategorySettings[]): CategorySettings[] => {
  const orderedCategories = categories.map((category, index) => ({
    ...category,
    order: index
  }));
  
  saveCategories(orderedCategories);
  return orderedCategories;
};

// Update video categories when a category is renamed or deleted
export const updateVideoCategoriesAfterCategoryChange = (
  oldCategoryId: string, 
  newCategoryId?: string
): void => {
  const videosString = localStorage.getItem('bankzen_videos') || '[]';
  const videos = JSON.parse(videosString);
  
  const updatedVideos = videos.map((video: any) => {
    if (video.category === oldCategoryId) {
      return {
        ...video,
        category: newCategoryId || 'aptitude' // Default to aptitude if category is deleted
      };
    }
    return video;
  });
  
  localStorage.setItem('bankzen_videos', JSON.stringify(updatedVideos));
};
