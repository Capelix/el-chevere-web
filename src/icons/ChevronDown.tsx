/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */

interface Props {
	classes?: string
}

export const ChevronDown = ({ classes }: Props) => {
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
			<polyline points='6 9 12 15 18 9' />
		</svg>
	)
}

