/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */

interface Props {
	classes?: string
}

export const CalendarDate = ({ classes }: Props) => {
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
			<path d='M8 2v4' />
			<path d='M16 2v4' />
			<rect width='18' height='18' x='3' y='4' rx='2' />
			<path d='M3 10h18' />
		</svg>
	)
}

