import type { Schedule } from '@/interfaces/schedule'
import type { Date } from '@/interfaces/date'
import { getSchedule } from './schedules'
import { DateStatus } from '@/interfaces/dateStatus'
import { currentDate } from '@/libs/consts'

// Times that can only have 1 appointment if it's today
const noDoubleDatesTime = ['8-00', '8-40', '9-20', '14-00', '17-20', '18-00']

/**
 * Fetches appointments for a specific date
 */
export const fetchAppointmentsForDate = async (date: string): Promise<Date[]> => {
	try {
		const res = await fetch('/api/db/get-dates', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				column: 'date',
				value: date,
			}),
		})

		const { data, error }: { data: Date[]; error: any } = await res.json()

		if (error) {
			console.error('Error fetching appointments:', error)
			return []
		}

		return data || []
	} catch (error) {
		console.error('Error fetching appointments:', error)
		return []
	}
}

/**
 * Checks if a time slot is available for a given date
 */
const isTimeAvailable = (
	timeId: string,
	appointments: Date[],
	selectedDate: string
): boolean => {
	// Filter active appointments (exclude DONE and CANCELLED)
	const activeAppointments = appointments.filter(
		(apt) =>
			apt.time === timeId &&
			apt.date === selectedDate &&
			apt.status !== DateStatus.DONE &&
			apt.status !== DateStatus.CANCELLED
	)

	const isToday = selectedDate === currentDate
	const isNoDoubleTime = noDoubleDatesTime.includes(timeId)

	// For no-double times on today: available if 0 active appointments (max 1 total, so if 1 exists, it's full)
	// For no-double times on future dates: available if less than 2 active appointments (max 2 total)
	// For regular times: available if less than 2 active appointments (max 2 total)
	if (isNoDoubleTime && isToday) {
		return activeAppointments.length < 1
	}

	return activeAppointments.length < 2
}

/**
 * Checks if a time is in the past for today's date
 */
const isPastTime = (timeId: string, selectedDate: string): boolean => {
	if (selectedDate !== currentDate) {
		return false
	}

	const now = new Date()
	const [hours, minutes] = timeId.split('-').map(Number)
	const timeDate = new Date()
	timeDate.setHours(hours, minutes, 0, 0)

	return timeDate < now
}

/**
 * Gets available time slots for a selected date
 */
export const getAvailableTimes = async (
	selectedDate: string
): Promise<Schedule[]> => {
	// Get all schedule options
	const allScheduleOptions = getSchedule().filter((option) => option.available === true)

	// Fetch appointments for the selected date
	const appointments = await fetchAppointmentsForDate(selectedDate)

	// Filter available times
	const availableTimes = allScheduleOptions.filter((option) => {
		// Skip past times if it's today
		if (isPastTime(option.id, selectedDate)) {
			return false
		}

		// Check if the time slot is available
		return isTimeAvailable(option.id, appointments, selectedDate)
	})

	return availableTimes
}

