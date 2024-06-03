import { ComponentMeta, ComponentStory } from '@storybook/react'

import BackButton from '.'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'atoms/Button',
	component: BackButton,
} as ComponentMeta<typeof BackButton>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof BackButton> = (args) => <BackButton {...args} />

export const main = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
main.args = {
	onBackURL: 'https://www.google.com/',
}
