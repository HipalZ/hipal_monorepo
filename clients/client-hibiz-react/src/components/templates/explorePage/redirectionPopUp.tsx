import type { ICategory, IDish } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { memo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { combineAllDishes } from "./explorePageStore";
import { useQuery } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";
import { IoIosSearch } from "react-icons/io";
import SubHeader from "@/components/atom/subHeader";

interface IProps {
    setClickRedirect: (value: boolean) => void;
    handleSaveRedirections: (selectedLink: string, selectedId: string, itemName: string) => void;
}

enum RedirectionType {
    CATEGORIES = 'CATEGORY',
    DISHES = 'DISH'
}

const MemoRedirectionPopUp = (props: IProps) => {
    const { handleSaveRedirections, setClickRedirect } = props;
    const businessId = useParams()?.businessId;
    const [selectedLink, setSelectedLink] = useState('');
    const [itemName, setItemName] = useState('');
    const [dishes, setDishes] = useState<IDish[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [filteredDishes, setFilteredDishes] = useState<IDish[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSelectCategory = () => {
        setSelectedLink(RedirectionType.CATEGORIES);
    }

    const [isVisible, setIsVisible] = useState(false);

    const toggleSearch = () => {
        setIsVisible(!isVisible);
    };

    const handleSelectDish = () => {
        setSelectedLink(RedirectionType.DISHES);
    }

    const handleSave = () => {
        handleSaveRedirections(selectedLink, selectedId, itemName);
        setClickRedirect(false);
    }

    const handleItem = (id: string, name: string) => {
        setSelectedId(id)
        setItemName(name)
    }

    const getAllCategoryData = async (businessId: string) => {
        const categoryResponse = await apiRpc.categories.$get({
            query: {
                businessId: businessId
            },
        });
        const data = await categoryResponse.json();
        const categories = data?.data;
        setCategories(categories);
        setFilteredCategories(categories);
        const allDishes = combineAllDishes(categories);
        return allDishes;
    };

    useQuery<ICategory[]>({
        queryKey: ['categories', businessId],
        queryFn: async () => {
            const res = await getAllCategoryData(businessId || '');
            setDishes(res);
            setFilteredDishes(res);
            return res;
        },
        enabled: !!businessId,
    });

    useEffect(() => {
        if (selectedLink === RedirectionType.CATEGORIES) {
            setFilteredCategories(
                categories.filter(category => 
                    category.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else if (selectedLink === RedirectionType.DISHES) {
            setFilteredDishes(
                dishes.filter(dish => 
                    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, selectedLink, categories, dishes]);

    return (
        <section className='m-6 h-[80vh] overflow-y-auto'>
            <center className='mb-4 text-2xl'>Add Redirection</center>
            {selectedLink === '' ? (
                <article>
                    <SubHeader text="Link Action Button" />
                    <article className='p-4 space-y-10 bg-white rounded-2xl'>
                        <button onClick={handleSelectCategory} type="button" className='w-full py-2 bg-gray-100 rounded-full'>
                            <h1>&#128279; Direct to Category</h1>
                        </button>
                        <button onClick={handleSelectDish} type="button" className='w-full py-2 bg-gray-100 rounded-full'>
                            <h1>&#128279; Direct to Dish</h1>
                        </button>
                    </article>
                </article>
            ) : (
                <>
                    <div className="relative flex items-center justify-between h-6 mx-6 mt-4 space-x-10">
                        <div className="w-[90vw]">
                            {isVisible && (
                                <input
                                    type="search"
                                    className='h-[2rem] border border-gray-300 rounded-2xl'
                                    placeholder="Search for a dish or category"
                                    value={searchQuery}
                                    autoFocus
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="w-24">
                            <IoIosSearch size={20} onClick={toggleSearch} />
                        </div>
                    </div>
                    <article className='mt-6'>
                        {selectedLink === RedirectionType.CATEGORIES && filteredCategories.map((cat) => (
                            <section key={cat?._id} className='flex items-center gap-4 p-4 m-2 bg-white rounded-2xl'>
                                <label className='flex items-center w-full gap-4 cursor-pointer'>
                                    <input
                                        type="radio"
                                        name="cat"
                                        className='text-2xl text-black'
                                        onChange={() => handleItem(cat?._id, cat?.name)}
                                    />
                                    <span className='text-xl truncate'>{cat?.name}</span>
                                </label>
                            </section>
                        ))}
                        {selectedLink === RedirectionType.DISHES && Array.isArray(filteredDishes) && filteredDishes.map((dish) => (
                            <section key={dish?._id} className='flex items-center gap-4 p-4 m-2 bg-white rounded-2xl'>
                                <label className='flex items-center w-full gap-4 cursor-pointer'>
                                    <input
                                        type="radio"
                                        name="dish"
                                        className='text-2xl text-black'
                                        onChange={() => handleItem(dish?._id, dish?.name)}
                                    />
                                    <span className='text-xl truncate'>{dish?.name}</span>
                                </label>
                            </section>
                        ))}
                    </article>
                    <BottomButton text='Save' onClick={handleSave} />
                </>
            )}
        </section>
    );
}

const RedirectionPopUp = memo(MemoRedirectionPopUp);
export default RedirectionPopUp;
