import type { ReactNode } from "react"

const Background = ({children}:{children:ReactNode}) => {
  return (
    <div className="p-3 my-2 bg-white rounded-2xl">{children}</div>
  )
}

export default Background