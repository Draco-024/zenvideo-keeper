
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CategorySettings } from '@/types/video';
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  updateVideoCategoriesAfterCategoryChange
} from '@/utils/categoryUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Pencil, Trash, MoveUp, MoveDown, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onCategoriesChange?: () => void;
}

export const CategoryManagementDialog = ({ 
  open, 
  onClose,
  onCategoriesChange
}: CategoryManagementDialogProps) => {
  const [categories, setCategories] = useState<CategorySettings[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = () => {
    const loadedCategories = getCategories();
    // Sort by order before displaying
    setCategories([...loadedCategories].sort((a, b) => a.order - b.order));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    // Check if category already exists
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({
        title: "Category Already Exists",
        description: "A category with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    const updatedCategories = addCategory(newCategoryName.trim());
    setCategories([...updatedCategories].sort((a, b) => a.order - b.order));
    setNewCategoryName('');
    toast({
      title: "Category Added",
      description: `${newCategoryName.trim()} has been added as a new category.`
    });
    
    if (onCategoriesChange) {
      onCategoriesChange();
    }
  };

  const handleStartEdit = (category: CategorySettings) => {
    setEditingCategory(category.id);
    setEditedName(category.name);
  };

  const handleSaveEdit = (categoryId: string) => {
    if (!editedName.trim()) return;

    const oldCategory = categories.find(cat => cat.id === categoryId);
    
    if (!oldCategory) return;
    
    // Only update if name has changed
    if (oldCategory.name !== editedName.trim()) {
      // Check if new name already exists
      if (categories.some(cat => cat.id !== categoryId && cat.name.toLowerCase() === editedName.trim().toLowerCase())) {
        toast({
          title: "Name Already Used",
          description: "Another category already uses this name.",
          variant: "destructive"
        });
        return;
      }
      
      const updatedCategories = updateCategory(categoryId, { name: editedName.trim() });
      setCategories([...updatedCategories].sort((a, b) => a.order - b.order));
      
      toast({
        title: "Category Updated",
        description: `Category has been renamed to ${editedName.trim()}.`
      });
      
      if (onCategoriesChange) {
        onCategoriesChange();
      }
    }
    
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Update videos with this category
    updateVideoCategoriesAfterCategoryChange(categoryId);
    
    // Delete the category
    const updatedCategories = deleteCategory(categoryId);
    setCategories([...updatedCategories].sort((a, b) => a.order - b.order));
    
    toast({
      title: "Category Deleted",
      description: "The category has been deleted. Videos in this category have been moved to Aptitude."
    });
    
    if (onCategoriesChange) {
      onCategoriesChange();
    }
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the elements
    [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];
    
    // Update order property
    const updatedCategories = reorderCategories(newCategories);
    setCategories([...updatedCategories].sort((a, b) => a.order - b.order));
    
    toast({
      title: "Categories Reordered",
      description: "The category order has been updated."
    });
    
    if (onCategoriesChange) {
      onCategoriesChange();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex space-x-2">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="border rounded-md">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No categories found
              </div>
            ) : (
              <div className="divide-y">
                {categories.map((category, index) => (
                  <div key={category.id} className="p-3 flex items-center justify-between">
                    {editingCategory === category.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSaveEdit(category.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleMoveCategory(index, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleMoveCategory(index, 'down')}
                            disabled={index === categories.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleStartEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will delete the "{category.name}" category. Videos in this category will be moved to the default Aptitude category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
