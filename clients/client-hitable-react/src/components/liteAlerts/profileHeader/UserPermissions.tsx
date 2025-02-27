import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import { CheckCircle, Lock } from "lucide-react"
import { motion } from "framer-motion"

const UserPermissions = () => {
  const user = useHiClientZ((s) => s.captainData)
  const [hoveredPermission, setHoveredPermission] = useState<string | null>(null)

  // Extract permissions from the first business association (assuming one for now)
  const permissions = user.customRole?.[0]?.permissions || {}

  return (
    <Card className="w-full max-w-2xl bg-white border-none shadow-none rounded-3xl">
      <h2 className="mt-4 mb-6 ml-4 text-2xl font-bold text-gray-800">User Permissions</h2>
      <ScrollArea className="max-h-[100vh] overflow-auto hide-scrollbar pb-[10rem]">
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(permissions).map(([key, value]) => (
            <motion.div
              key={key}
              className="relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredPermission(key)}
              onHoverEnd={() => setHoveredPermission(null)}
            >
              <Card className="h-full transition-shadow duration-300 shadow-sm bg-gradient-to-br from-white to-gray-50 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex-shrink-0">
                    {value ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize">{key.replace(/_/g, " ")}</h3>
                  </div>
                </CardContent>
              </Card>
              {hoveredPermission === key && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="px-2 text-center text-white">
                    {value ? "You have access to this permission" : "You don't have access to this permission"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

export default UserPermissions

