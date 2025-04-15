
import { useState } from "react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LockIcon } from "lucide-react"
import MenuLayouts from "@/assets/menulayouts.jpg"
import { useAdminUpload } from "../store/useAdminUpload"

const AdminDashBoard = ({ setShowLogin }: { setShowLogin: () => void }) => {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const login = useAdminUpload((state) => state.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (password === "2701") {
        toast.success("Login successful! Redirecting...")
        login() // Update Zustand store
        setShowLogin() // Update parent component state
      } else {
        toast.error("Incorrect password. Please try again.")
        setIsLoading(false)
        return
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex justify-center w-full h-screen overflow-hidden">
      {/* Left side - Image */}
      <div className="items-center justify-center hidden w-1/2 bg-green-500 lg:flex">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="relative">
          <img
            src={MenuLayouts || "/placeholder.svg"}
            alt="Background"
            className="object-cover w-[480px] h-[480px] rounded-lg"
            style={{
              filter: "contrast(1.05) brightness(1.05) saturate(1.1)",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute inset-0 rounded-lg"
            style={{
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </motion.div>
      </div>
      {/* Right side - Login Form */}
      <div className="relative flex items-center justify-center w-full lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-100" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="z-10 w-full max-w-md p-8"
        >
          <div className="overflow-hidden rounded-xl backdrop-blur-lg">
            <div className="p-8 bg-green-500 border shadow-xl rounded-xl border-white/20 backdrop-filter backdrop-blur-md">
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.6,
                  }}
                  className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-white/30 backdrop-blur-sm"
                >
                  <LockIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                <p className="mt-2 text-white/80">Enter your password to continue</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6 space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-white border-white/20 bg-white/10 placeholder:text-white/50 focus:border-white/30 focus:ring-white/20"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    className="w-full text-white bg-white/20 hover:bg-white/30"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Login"}
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashBoard
