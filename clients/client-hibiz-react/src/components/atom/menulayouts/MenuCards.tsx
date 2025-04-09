import {NavLink } from "react-router-dom"

interface MenuItemProps {
    id: number
    title: string
    subTitle: string
    navigate: string
    image: string
}

interface MenuCardProps {
    menu: MenuItemProps
    businessId: string
}

const MenuCard = ({ menu, businessId }: MenuCardProps) => {
    if (!businessId) return null
    const { title, subTitle, navigate, image } = menu
    const linkPath = `${navigate}`

    return (
        <NavLink
            to={linkPath}
            className="w-[90%] md:w-[45%] lg:w-[30%] m-4 bg-white shadow-md rounded-lg text-left block hover:shadow-lg transition-shadow"
        >
            <img
                src={image || "/placeholder.svg"}
                alt={title}
                className="w-full h-[200px] object-cover object-top rounded-t-lg"
                loading="lazy"
            />
            <div className="p-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-gray-500 h-[4rem]">{subTitle}</p>
                <div className="inline-block px-4 py-2 mt-2 text-white bg-black rounded-lg">Go to {title}</div>
            </div>
        </NavLink>
    )
}

export default MenuCard

