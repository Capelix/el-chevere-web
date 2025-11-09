/* eslint-disable react/react-in-jsx-scope */

import { useState, useRef, useEffect } from 'preact/hooks'
import { CalendarDate } from '@/icons/CalendarDate'
import { ChevronDown } from '@/icons/ChevronDown'
import { getI18N } from '@/locales/index'

interface DatePickerProps {
	id?: string
	name?: string
	value?: string
	minDate?: string
	maxDate?: string
	onChange?: (value: string) => void
	required?: boolean
	className?: string
	currentLocale?: string
}

const formatDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const parseDate = (dateString: string): Date => {
	const [year, month, day] = dateString.split('-').map(Number)
	return new Date(year, month - 1, day)
}

const getDaysInMonth = (date: Date): number => {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const isSunday = (date: Date): boolean => {
	return date.getDay() === 0
}

const isDateDisabled = (date: Date, minDate?: string, maxDate?: string): boolean => {
	if (isSunday(date)) return true

	if (minDate) {
		const min = parseDate(minDate)
		// Compare only date parts (year, month, day) by setting time to midnight
		const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		const minOnly = new Date(min.getFullYear(), min.getMonth(), min.getDate())
		if (dateOnly < minOnly) return true
	}

	if (maxDate) {
		const max = parseDate(maxDate)
		// Compare only date parts (year, month, day) by setting time to midnight
		const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
		const maxOnly = new Date(max.getFullYear(), max.getMonth(), max.getDate())
		if (dateOnly > maxOnly) return true
	}

	return false
}

const getMonthName = (date: Date, locale: string = 'en'): string => {
	return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export const DatePicker = ({
	id,
	name,
	value,
	minDate,
	maxDate,
	onChange,
	required,
	className = '',
	currentLocale,
}: DatePickerProps) => {
	const [i18n] = useState(getI18N({ currentLocale }))
	const [isOpen, setIsOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState<Date>(() => {
		if (value) {
			return parseDate(value)
		}
		return minDate ? parseDate(minDate) : new Date()
	})
	const [selectedDate, setSelectedDate] = useState<string | undefined>(value)
	const containerRef = useRef<HTMLDivElement>(null)

	// Update selected date when value prop changes
	useEffect(() => {
		if (value !== undefined) {
			setSelectedDate(value)
			if (value) {
				setCurrentMonth(parseDate(value))
			}
		}
	}, [value])

	// Close calendar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	const handleDateSelect = (date: Date) => {
		if (isDateDisabled(date, minDate, maxDate)) return

		const dateString = formatDate(date)
		setSelectedDate(dateString)
		setIsOpen(false)
		if (onChange) {
			onChange(dateString)
		}
	}

	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentMonth((prev) => {
			const newDate = new Date(prev)
			if (direction === 'prev') {
				newDate.setMonth(prev.getMonth() - 1)
			} else {
				newDate.setMonth(prev.getMonth() + 1)
			}
			return newDate
		})
	}

	const renderCalendarDays = () => {
		const daysInMonth = getDaysInMonth(currentMonth)
		const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
		// Convert Sunday (0) to 7 for easier calculation
		const firstDayOfWeek = firstDay === 0 ? 7 : firstDay
		const days: (Date | null)[] = []

		// Add empty cells for days before the first day of the month
		for (let i = 1; i < firstDayOfWeek; i++) {
			days.push(null)
		}

		// Add all days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
			days.push(date)
		}

		// Split into weeks (7 days per week)
		const weeks: (Date | null)[][] = []
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7))
		}

		// Ensure last week has 7 elements (pad with nulls if needed)
		if (weeks.length > 0) {
			const lastWeek = weeks[weeks.length - 1]
			while (lastWeek.length < 7) {
				lastWeek.push(null)
			}
		}

		return weeks
	}

	const displayValue = selectedDate
		? (() => {
				const [year, month, day] = selectedDate.split('-').map(Number)
				const locale = currentLocale === 'en' ? 'en-US' : 'es-ES'
				return new Date(year, month - 1, day).toLocaleDateString(locale, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})
			})()
		: ''

	const calendarWeeks = renderCalendarDays()
	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	// Check if we can navigate to previous/next month
	const canGoPrev = () => {
		if (!minDate) return true
		const min = parseDate(minDate)
		const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		// Check if previous month's year/month is greater than or equal to min date's year/month
		return (
			prevMonth.getFullYear() > min.getFullYear() ||
			(prevMonth.getFullYear() === min.getFullYear() && prevMonth.getMonth() >= min.getMonth())
		)
	}

	const canGoNext = () => {
		if (!maxDate) return true
		const max = parseDate(maxDate)
		const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		// Check if next month's year/month is less than or equal to max date's year/month
		return (
			nextMonth.getFullYear() < max.getFullYear() ||
			(nextMonth.getFullYear() === max.getFullYear() && nextMonth.getMonth() <= max.getMonth())
		)
	}

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			{/* Hidden input for form submission */}
			<input type='hidden' id={id} name={name} value={selectedDate || ''} required={required} />

			{/* Display Input */}
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='w-full rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-left text-sm text-primary outline-none transition-all placeholder:text-slate-500/70 hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
			>
				<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
					<CalendarDate classes='size-[18px]' />
				</div>
				<span className={displayValue ? 'text-primary' : 'text-slate-500'}>
					{displayValue || i18n.SELECT_DATE}
				</span>
				<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
					<ChevronDown classes={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
				</div>
			</button>

			{/* Calendar Dropdown */}
			{isOpen && (
				<div className='absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] rounded-lg border border-slate-600/40 bg-gradient-to-br from-slate-800/95 to-slate-900/95 p-4 shadow-2xl backdrop-blur-sm'>
					{/* Calendar Header */}
					<div className='mb-4 flex items-center justify-between'>
						<button
							type='button'
							onClick={() => navigateMonth('prev')}
							disabled={!canGoPrev()}
							className='rounded-md px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
						>
							‹
						</button>
						<h3 className='text-sm font-semibold text-primary'>
							{getMonthName(currentMonth, currentLocale === 'en' ? 'en' : 'es')}
						</h3>
						<button
							type='button'
							onClick={() => navigateMonth('next')}
							disabled={!canGoNext()}
							className='rounded-md px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'
						>
							›
						</button>
					</div>

					{/* Week Day Headers */}
					<div className='mb-2 grid grid-cols-7 gap-1'>
						{weekDays.map((day, index) => {
							const isSunday = index === 6
							return (
								<div
									key={day}
									className={`py-2 text-center text-xs font-semibold uppercase ${
										isSunday ? 'text-slate-600 opacity-50' : 'text-slate-400'
									}`}
								>
									{day}
								</div>
							)
						})}
					</div>

					{/* Calendar Grid */}
					<div className='grid grid-cols-7 gap-1'>
						{calendarWeeks.map((week, weekIndex) =>
							week.map((day, dayIndex) => {
								if (!day) {
									return <div key={`empty-${weekIndex}-${dayIndex}`} className='aspect-square' />
								}

								const dateString = formatDate(day)
								const isSundayDay = isSunday(day)
								const isDisabled = isDateDisabled(day, minDate, maxDate)
								const isSelected = selectedDate === dateString
								const isToday = formatDate(new Date()) === dateString

								return (
									<button
										key={dateString}
										type='button'
										onClick={() => handleDateSelect(day)}
										disabled={isDisabled || isSundayDay}
										className={`aspect-square rounded-md text-sm font-medium transition-all ${
											isSundayDay
												? 'cursor-not-allowed text-slate-600 line-through opacity-40'
												: isSelected
													? 'bg-accent text-white shadow-lg'
													: isToday
														? 'bg-slate-700/50 text-accent ring-2 ring-accent/50'
														: isDisabled
															? 'cursor-not-allowed text-slate-600 opacity-30'
															: 'text-slate-300 hover:bg-slate-700/50 hover:text-primary'
										} `}
										title={isSundayDay ? i18n.SUNDAYS_NOT_AVAILABLE : ''}
									>
										{day.getDate()}
									</button>
								)
							})
						)}
					</div>

					{/* Info Text */}
					<div className='mt-4 border-t border-slate-600/30 pt-3 text-center'>
						<p className='text-xs text-slate-500'>{i18n.SUNDAYS_NOT_AVAILABLE}</p>
					</div>
				</div>
			)}
		</div>
	)
}
