/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */

interface Props {
	classes?: string
}

export const Clock = ({ classes }: Props) => {
	return (
		<svg
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			stroke-width='2'
			stroke-linecap='round'
			stroke-linejoin='round'
			class={classes}
		>
			<circle cx='12' cy='12' r='10' />
			<polyline points='12 6 12 12 16 14' />
		</svg>
	)
}

