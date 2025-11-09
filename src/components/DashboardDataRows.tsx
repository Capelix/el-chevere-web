import { DateStatus } from '@/interfaces/dateStatus'
import { getI18N } from '@/locales/index'

/* eslint-disable react/react-in-jsx-scope */
interface Props {
	idx: number
	name: string
	date: string
	time: string
	status?: string
	phone: string
	mode: string
	currentLocale?: string
	data_row: string
	onClick: (event: preact.JSX.TargetedEvent<HTMLTableRowElement, Event>) => void
}

export const DashboardDataRows = ({
	idx,
	name,
	date,
	time,
	status,
	phone,
	mode,
	currentLocale,
	data_row,
	onClick,
}: Props) => {
	const i18n = getI18N({ currentLocale })

	const getStatusBadge = () => {
		if (status === DateStatus.DONE) {
			return (
				<div className='inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1'>
					<span className='size-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50'></span>
					<span className='text-xs font-medium text-green-400'>{i18n.DONE}</span>
				</div>
			)
		}
		if (status === DateStatus.PENDING) {
			return (
				<div className='inline-flex items-center gap-2 rounded-full bg-gray-500/20 px-3 py-1'>
					<span className='size-2 rounded-full bg-gray-500 shadow-sm shadow-gray-500/50'></span>
					<span className='text-xs font-medium text-gray-400'>{i18n.PENDING}</span>
				</div>
			)
		}
		if (status === DateStatus.CANCELLED) {
			return (
				<div className='inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1'>
					<span className='size-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50'></span>
					<span className='text-xs font-medium text-red-400'>{i18n.CANCELLED}</span>
				</div>
			)
		}
		if (status === DateStatus.OVERDUE) {
			return (
				<div className='inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1'>
					<span className='size-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50'></span>
					<span className='text-xs font-medium text-yellow-400'>{i18n.OVERDUE}</span>
				</div>
			)
		}
		return (
			<div className='inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-1'>
				<span className='size-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50'></span>
				<span className='text-xs font-medium text-orange-400'>{i18n.CONFIRMED}</span>
			</div>
		)
	}

	return (
		<tr
			data-row={data_row}
			onClick={onClick}
			className='group cursor-pointer border-b border-white/5 transition-all hover:bg-white/5 active:bg-white/10'
		>
			<td className='px-4 py-4'>
				<span className='text-sm font-medium text-secondary'>{idx}</span>
			</td>
			<td className='px-4 py-4'>
				<span className='font-medium text-primary group-hover:text-accent transition-colors'>{name}</span>
			</td>
			<td className='hidden px-4 py-4 text-sm text-secondary sm:table-cell'>{phone}</td>
			<td className='px-4 py-4'>
				<span className='text-sm font-medium text-primary'>{date}</span>
			</td>
			<td className='px-4 py-4'>
				<span className='text-sm font-medium text-primary'>{time}</span>
			</td>
			<td className='hidden px-4 py-4 text-sm text-secondary md:table-cell'>{mode}</td>
			<td className='px-4 py-4'>{getStatusBadge()}</td>
		</tr>
	)
}
