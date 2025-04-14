import { useState, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAddCategoryById } from "@/hooks/useAdminUpload"
import { CheckIcon, Loader2Icon } from "lucide-react"
import { useParams } from "react-router-dom"
import toast from "react-hot-toast"

type CategoryModalProps = {
  isOpen: boolean
  onClose: () => void
}

function AddBusinessCategoryModal({ isOpen, onClose}: CategoryModalProps) {
  const businessId = useParams().businessId
  const { addCategoryById } = useAddCategoryById()
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false)

  const handleCreateDefaultCategories = async () => {
    if (!businessId) {
      toast.error("Business ID is missing")
      return
    }

    setIsCreatingDefaults(true)

    try {
      // Create the three default categories
      const defaultCategories = [
        { name: "Ambience", description: "Photos showcasing the atmosphere and environment of your business" },
        { name: "Food", description: "Images of your food items, dishes, and culinary creations" },
        { name: "Vibe", description: "Pictures capturing the mood, energy, and overall experience" },
      ]

      // Create categories sequentially
      for (const category of defaultCategories) {
        await addCategoryById({
          name: category.name,
          description: category.description,
          businessId,
        })
      }

      toast.success("Default categories created successfully")
      onClose()
    } catch (error) {
      console.error("Error creating default categories:", error)
      toast.error("Failed to create default categories")
    } finally {
      setIsCreatingDefaults(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="bg-green-100 p-1.5 rounded-full"
                >
                  <CheckIcon className="w-4 h-4 text-green-600" />
                </motion.div>
                Create Categories
              </DialogTitle>
            </DialogHeader>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
              <p className="mb-2 text-lg font-medium">Do you want to create new categories?</p>
              <p className="mb-6 text-sm text-gray-500">
                We'll create three default categories: Ambience, Food, and Vibe
              </p>

              <div className="flex justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={onClose} className="px-8" disabled={isCreatingDefaults}>
                    No
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleCreateDefaultCategories}
                    className="px-8 bg-green-500 hover:bg-green-600"
                    disabled={isCreatingDefaults}
                  >
                    {isCreatingDefaults ? (
                      <>
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Yes"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const MemoizedAddBusinessCategoryModal = memo(AddBusinessCategoryModal)

// Export both the memoized and non-memoized versions
export { AddBusinessCategoryModal }
