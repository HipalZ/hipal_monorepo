import { useState ,useEffect} from "react"
import AdminDashBoard from "@/components/uploadAdmin"
import { useAdminUpload } from "@/components/store/useAdminUpload"
import { CategoriesDashboard } from "@/components/uploadAdmin/categoriesDashboard"

// Create a client

export default function AdminLogin() {
  const {isAuthenticated,logout} = useAdminUpload((state) => ({
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    logout: state.logout,
  }))
  const [showLogin, setShowLogin] = useState(true)

  const logoutFunc =() =>{
    setShowLogin(true)
    logout()
    console.log("logout")
  }

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false)
    }
  }, [isAuthenticated])
  


  return (
    <>
      {showLogin && !isAuthenticated ? (
        <AdminDashBoard setShowLogin={() => setShowLogin(false)} />
      ) : (
        <CategoriesDashboard logout={logoutFunc} />
      )}
    </>
  )
}
