import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAdminUploadHook } from "@/hooks/useAdminUpload"
import { CheckIcon, XIcon, Loader2Icon } from "lucide-react"

type CategoryModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { addCategory, isAdding } = useAdminUploadHook()
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    setFormState("submitting")

    try {
      await addCategory({ name, description })
      setFormState("success")

      // Reset form after success animation
      setTimeout(() => {
        setName("")
        setDescription("")
        setFormState("idle")
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error adding category:", error)
      setFormState("error")

      // Reset error state after a delay
      setTimeout(() => {
        setFormState("idle")
      }, 2000)
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
                Create New Category
              </DialogTitle>
            </DialogHeader>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="grid gap-4 py-4">
                <motion.div
                  className="grid gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    required
                    className="border-green-200 focus-visible:ring-green-500"
                  />
                </motion.div>
                <motion.div
                  className="grid gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                    className="border-green-200 focus-visible:ring-green-500"
                  />
                </motion.div>
              </div>
              <DialogFooter>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="button" variant="outline" onClick={onClose} className="gap-2">
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={formState !== "idle" || !name.trim()}
                    className={`gap-2 ${formState === "success" ? "bg-green-500" : formState === "error" ? "bg-red-500" : "bg-green-500"}`}
                  >
                    {formState === "submitting" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                      >
                        <Loader2Icon className="w-4 h-4" />
                      </motion.div>
                    )}
                    {formState === "success" && <CheckIcon className="w-4 h-4" />}
                    {formState === "error" && <XIcon className="w-4 h-4" />}
                    {formState === "idle" && "Create Category"}
                    {formState === "submitting" && "Creating..."}
                    {formState === "success" && "Created!"}
                    {formState === "error" && "Failed!"}
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
