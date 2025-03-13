import MemoizedHeader from "@/components/molecules/header"
import { FaArrowLeft } from "react-icons/fa"

const AddRestaurant = () => {
  return (
    <main>
        <header className=" linear_gradient_background">
                <MemoizedHeader
                    title="Link Restaurant"
                    leftIcon={<FaArrowLeft />}
                />
            </header>
    </main>
  )
}

export default AddRestaurant
