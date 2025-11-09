/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Date } from '@/interfaces/date'
import { getI18N } from '@/locales/index'
import { useState } from 'preact/hooks'
import { DateStatus } from '@/interfaces/dateStatus'
import { currentDate } from '@/libs/consts'

const posibleDatesTime = [
	'8-00',
	'8-40',
	'9-20',
	'10-00',
	'10-40',
	'11-20',
	'12-00',
	'12-40',
	'13-20',
	'14-00',
	'14-40',
	'15-20',
	'16-00',
	'16-40',
	'17-20',
	'18-00',
]

const posibleModes = ['digital', 'time', 'both']
const posibleReasons = ['birthday', 'month', 'event', 'familiar']
const noDoubleDatesTime = ['8-00', '8-40', '9-20', '14-00', '17-20', '18-00']

export function useScheduler() {
	const [sending, setSending] = useState(false)
	const [error, setError] = useState(false)

	const sendSchedule = async (
		scheduleData: Date,
		currentLocale: string | undefined = 'es',
		callback: () => void
	) => {
		const i18n = getI18N({ currentLocale })

		setSending(true)
		setError(false)

		try {
			if (!scheduleData) {
				throw new Error('Schedule data is required')
			}

			const scheduleTime: string = scheduleData.time
			const scheduleDate: string = scheduleData.date
			const date: string | undefined = posibleDatesTime.find((time) => time === scheduleTime)
			const mode: string | undefined = posibleModes.find((mode) => mode === scheduleData.mode)
			const reason: string | undefined = posibleReasons.find(
				(reason) => reason === scheduleData.reason
			)
			const isDoubleDate: boolean =
				noDoubleDatesTime.includes(scheduleTime) && scheduleData.date === currentDate

			// Check if the time is valid
			if (scheduleTime !== date || !date) {
				throw new Error('Invalid time')
			}

			// Check if mode is valid
			if (scheduleData.mode !== mode || !mode) {
				throw new Error('Invalid mode')
			}

			// Check if people is valid
			if (scheduleData.people < 1 || scheduleData.people > 10) {
				throw new Error('Invalid people amount')
			}

			// Check if outfits is valid
			if (scheduleData.outfits < 1) {
				throw new Error('Invalid outfits amount')
			}

			// Check if reason is valid
			if (scheduleData.reason !== reason || !reason) {
				throw new Error('Invalid reason')
			}

			// Check if the date is in the past
			const selectedDate = new Date(scheduleData.date)
			if (selectedDate < new Date(currentDate)) {
				throw new Error('Date is in the past')
			}

			// Check if the date is a Sunday
			if (selectedDate.getUTCDay() === 0) {
				window.toast({
					dismissible: true,
					title: i18n.NO_SUNDAYS,
					location: 'bottom-center',
					type: 'warning',
					icon: true,
				})

				throw new Error('Date is on Sunday')
			}

			// Check if current date and current time are valid
			// and aren't in the past
			const currentDateTime = new Date(currentDate)
			const currentTime = new Date()

			currentTime.setHours(
				parseInt(scheduleTime.split('-')[0]),
				parseInt(scheduleTime.split('-')[1])
			)

			if (currentDateTime.getTime() === selectedDate.getTime()) {
				if (currentTime.getTime() < new Date().getTime()) {
					throw new Error('Current date and time are in the past')
				}
			}

			// Check if the date is already taken
			const res = await fetch('/api/db/get-dates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					column: 'time',
					value: scheduleTime,
					column2: 'date',
					value2: scheduleDate,
				}),
			})

			const { data, error }: { data: Date[]; error: any } = await res.json()

			if (error) {
				console.error('Error fetching dates:', error)
			}

			if (data && data.length >= 2) {
				data.forEach((item: Date) => {
					if (
						item.status !== DateStatus.DONE &&
						item.time === scheduleTime &&
						item.date === scheduleDate
					) {
						window.toast({
							dismissible: true,
							title: i18n.DATE_TAKEN,
							location: 'bottom-center',
							type: 'warning',
							icon: true,
						})

						throw new Error('Time already taken')
					}
				})
			}

			if (data && data.length === 1) {
				data.forEach((item) => {
					if (
						item.status !== DateStatus.DONE &&
						item.time === scheduleTime &&
						item.date === scheduleDate &&
						isDoubleDate
					) {
						window.toast({
							dismissible: true,
							title: i18n.DATE_TAKEN,
							location: 'bottom-center',
							type: 'warning',
							icon: true,
						})

						throw new Error('Time already taken')
					}
				})
			}

			// Insert the date into the database
			const response = await fetch('/api/db/insert-dates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ...scheduleData }),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.message || 'Error sending date')
			}

			window.toast({
				dismissible: true,
				title: i18n.DATE_INSERTED,
				location: 'bottom-center',
				type: 'success',
				icon: true,
			})

			callback?.()
		} catch (error) {
			window.toast({
				dismissible: true,
				title: i18n.DATE_INSERTED_ERROR,
				location: 'bottom-center',
				type: 'error',
				icon: true,
			})

			setError(true)
			console.error('Error sending date:', error)
		} finally {
			setSending(false)
		}
	}

	return { sending, setSending, error, setError, sendSchedule }
}
