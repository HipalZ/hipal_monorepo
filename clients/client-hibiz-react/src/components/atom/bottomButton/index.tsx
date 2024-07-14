import { memo } from "react"

const MemoBottomButton = (props:{text:string, onClick?:()=>void}) => {
    const { text, onClick } = props
    return (
        <section className='fixed bottom-4 left-6 right-6 md:max-w-[26rem] md:left-0 md:right-0 md:mx-auto'>
            <button onClick={onClick} type="submit" className="action_btn" >
                {text}
            </button>
        </section>
    )
}

const BottomButton = memo(MemoBottomButton)
export default BottomButton