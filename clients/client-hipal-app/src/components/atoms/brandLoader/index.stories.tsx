import { ComponentMeta, ComponentStory } from "@storybook/react"

import BrandLoader from "."

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: "atoms/BrandLoader",
	component: BrandLoader,
} as ComponentMeta<typeof BrandLoader>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BrandLoader> = (args) => <BrandLoader {...args} />

export const main = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
main.args = {}
