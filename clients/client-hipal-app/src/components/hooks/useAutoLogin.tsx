import { apiRpc } from "@hi/common"

export const getUserInfo = async (userId: string) => {
  if (!userId) {
    return null
  }

  try {
    const response = await apiRpc.users.user_profile[":userId"].$get({
      param: {
        userId,
      },
    })

  
    return response
  } catch (error) {
    console.error("Error fetching user info:", error)
    throw error
  }
}

