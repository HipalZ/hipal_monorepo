import { ComponentMeta, ComponentStory } from "@storybook/react"
import React from "react"
import { FiPhone } from "react-icons/fi"
import OnImgButton from "."

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: "atoms/OnImgButton",
	component: OnImgButton,
} as ComponentMeta<typeof OnImgButton>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof OnImgButton> = (args) => <OnImgButton {...args} />

export const main = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
main.args = {
	children: <FiPhone />,
	appendClassNames: "btn-circle ",
}
