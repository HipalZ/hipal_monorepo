import { memo, useEffect, useState } from "react"
import { HiOutlineColorSwatch } from "react-icons/hi"

const themes = [
	"light",
	"dark",
	"cupcake",
	"bumblebee",
	"emerald",
	"corporate",
	"synthwave",
	"retro",
	"cyberpunk",
	"valentine",
	"halloween",
	"garden",
	"forest",
	"aqua",
	"lofi",
	"pastel",
	"fantasy",
	"wireframe",
	"black",
	"luxury",
	"dracula",
	"cmyk",
	"autumn",
	"business",
	"acid",
	"lemonade",
	"night",
	"coffee",
	"winter",
]

function Themes() {
	const [selected, setSelected] = useState("dark")

	// useEffect(() => {
	// 	themeChange(false)
	// 	// themeChange false parameter is required for react project
	// }, [])

	useEffect(() => {
		document.querySelector("html")?.setAttribute("data-theme", selected)
	}, [selected])

	const handleClick = (string: string) => {
		setSelected(string)
	}

	return (
		<>
			<label
				htmlFor="theme-change-modal"
				className=" modal-button btn bg-base-100 active:bg-base-300 hover:bg-base-200 text-base-content hover:shadow-md focus:outline-none sm:text-sm relative flex w-full py-2 pl-3 pr-10 space-x-2 text-left transition-colors rounded-lg cursor-pointer"
				title="Themes"
			>
				<span className=" block mr-auto truncate">{selected}</span>
				<span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
					<HiOutlineColorSwatch className="w-5 h-5 text-gray-400" aria-hidden="true" />
				</span>
			</label>

			<input type="checkbox" id="theme-change-modal" className="modal-toggle" />
			<label htmlFor="theme-change-modal" className="modal cursor-pointer">
				<label className="modal-box relative flex flex-col space-y-4" htmlFor="">
					<div className=" flex flex-row prose">
						<h2 className="">Choose Theme</h2>
						<label
							htmlFor="theme-change-modal"
							className="btn btn-primary btn-sm btn-circle ml-auto"
						>
							✕
						</label>
					</div>
					{themes.map((string, key) => (
						<div
							data-theme={string}
							className=" bg-transparent"
							key={key + string}
							onClick={() => handleClick(string)}
						>
							<button
								className={
									"btn !rounded-md !bg-base-100 w-full min-w-fit px-0 hover:ring-base-300 ring-2 active:ring-gray-800 " +
									(selected === string ? " ring-gray-800 " : "   ring-transparent ")
								}
							>
								<div className="text-base-content w-full font-sans cursor-pointer">
									<div className=" overflow-clip flex flex-row px-4 py-3 text-left">
										<div className="min-w-max flex-grow w-full text-sm font-bold">{string}</div>{" "}
										<div className="flex gap-1">
											<div className="bg-primary w-2 rounded"></div>
											<div className="bg-secondary w-2 rounded"></div>
											<div className="bg-accent w-2 rounded"></div>
											<div className="bg-neutral w-2 rounded"></div>
										</div>
									</div>
								</div>
							</button>
						</div>
					))}
				</label>
			</label>
		</>
	)
}

const MemoThemes = memo(Themes)
export default MemoThemes
