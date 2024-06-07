import { ComponentMeta, ComponentStory } from '@storybook/react'

import WallpaperCarousel from '.'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
	title: 'atoms/WallpaperCarousel',
	component: WallpaperCarousel,
} as ComponentMeta<typeof WallpaperCarousel>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof WallpaperCarousel> = (args) => <WallpaperCarousel {...args} />

export const main = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
main.args = {
	wallpapers: [
		'https://dev.storage.hipal.life/minio/assets/49126c57-5944-42e0-a038-960cac663d1b.jpeg',
		'https://dev.storage.hipal.life/minio/assets/49126c57-5944-42e0-a038-960cac663d1b.jpeg',
		'https://dev.storage.hipal.life/minio/assets/49126c57-5944-42e0-a038-960cac663d1b.jpeg',
	],
}
