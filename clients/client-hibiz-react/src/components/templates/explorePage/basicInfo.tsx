import { memo } from 'react'
import type { IProps } from './explorePageTopSection'
import SubHeader from '@/components/atom/subHeader'
import PlusButton from '@/components/atom/plusButton'

const MemoBasicInfo = (props:IProps) => {
    const { img, handleImageChange,handleBizName,bizName } = props
    return (
        <>
            <SubHeader text="Basic Info" />
            <section className='mt-4 flex justify-between items-center space-x-4'>
                <article className='shrink-0 relative rounded-xl h-[8rem] w-[8rem] border-dashed border-2 inline-block border-[#8C63FF]' >
                    <input onClick={() => document.getElementById('logoInput')?.click()} type='file' id='logoInput' style={{ display: 'none' }} onChange={handleImageChange} data-type="logo" />
                    <label htmlFor='logoInput' className='w-full h-full flex justify-center items-center cursor-pointer  overflow-hidden rounded-xl'>
                        {img.logo ? <img src={img.logo} alt="Logo" /> : <PlusButton />}
                    </label>
                </article>
                <input value={bizName} minLength={4} maxLength={30}  type="text" className='w-full rounded-xl' placeholder='Business Name' onChange={handleBizName}/>
            </section>
        </>
    )
}

const BasicInfo = memo(MemoBasicInfo)
export default BasicInfo