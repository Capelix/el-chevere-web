/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */

interface Props {
	classes?: string
}

export const UserCircle = ({ classes }: Props) => {
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
			<path stroke='none' d='M0 0h24v24H0z' fill='none' />
			<path d='M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0' />
			<path d='M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
			<path d='M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855' />
		</svg>
	)
}

