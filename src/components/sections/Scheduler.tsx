/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */

import { useRef, useState, useEffect } from 'preact/hooks'
import { getI18N } from '@/locales/index'
import { businessWhatsApp } from '@/libs/consts'
import { Loading } from '@/icons/Loading'
import { getSchedule } from '@/services/schedules'
import { useScheduler } from '@/hooks/useScheduler'
import { DateStatus } from '@/interfaces/dateStatus'
import { getReasons } from '@/services/reasons'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/db/supabase'
import { ScheduleGlobe } from '@/icons/ScheduleGlobe'
import { WhatsAppIcon } from '@/icons/WhatsAppIcon'
import { UserCircle } from '@/icons/UserCircle'
import { PhoneCall } from '@/icons/PhoneCall'
import { Clock } from '@/icons/Clock'
import { ChevronDown } from '@/icons/ChevronDown'
import { MessageCircle } from '@/icons/MessageCircle'
import { Monitor } from '@/icons/Monitor'
import { Users } from '@/icons/Users'
import { Tag } from '@/icons/Tag'
import { Package } from '@/icons/Package'
import { CalendarPlus } from '@/icons/CalendarPlus'
import { DatePicker } from '@/components/ui/DatePicker'
import { getAvailableTimes } from '@/services/availableTimes'
import type { Schedule } from '@/interfaces/schedule'

export const Scheduler = ({ currentLocale }: { currentLocale?: string }) => {
	const [i18n] = useState(getI18N({ currentLocale }))
	const { user, session, loading: authLoading } = useAuth()
	const [userProfile, setUserProfile] = useState<{
		name: string
		email: string
		phone: string
	} | null>(null)
	const [profileLoading, setProfileLoading] = useState(true)

	const today = new Date()
	const maxDate = new Date()
	maxDate.setDate(today.getDate() + 180)

	const format = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	// Get the earliest available appointment date
	// - If past 18:00 (6 PM), move to next day
	// - Skip Sundays (move to Monday if result is Sunday)
	const getEarliestAvailableDate = (): Date => {
		const now = new Date()
		const appointmentDate = new Date(now)

		// If current time is past 18:00 (6 PM), move to next day
		if (now.getHours() >= 18) {
			appointmentDate.setDate(now.getDate() + 1)
		}

		// Skip Sundays - if the date falls on Sunday (0), move to Monday (1)
		if (appointmentDate.getDay() === 0) {
			appointmentDate.setDate(appointmentDate.getDate() + 1)
		}

		return appointmentDate
	}

	// Get the initial date for the date picker
	const getInitialDate = (): string => {
		return format(getEarliestAvailableDate())
	}

	// Get the minimum selectable date
	const getMinDate = (): string => {
		return format(getEarliestAvailableDate())
	}

	const { sending, sendSchedule } = useScheduler()
	const [scheduleOptins, setScheduleOptions] = useState<Schedule[]>([])
	const [selectedDate, setSelectedDate] = useState<string>(getInitialDate())
	const [selectedTime, setSelectedTime] = useState<string>('')
	const [loadingTimes, setLoadingTimes] = useState(true)
	const formRef = useRef<HTMLFormElement | null>(null)

	// Check authentication and redirect if not logged in
	useEffect(() => {
		if (!authLoading) {
			if (!user || !session) {
				window.location.href = '/auth'
			}
		}
	}, [user, session, authLoading])

	// Fetch user profile data
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (!user || !session) {
				setProfileLoading(false)
				return
			}

			try {
				// Try to get profile from profiles table first
				const { data: profileData, error: profileError } = await supabase
					.from('profiles')
					.select('full_name, email, phone')
					.eq('auth_id', user.id)
					.single()

				if (!profileError && profileData) {
					setUserProfile({
						name:
							profileData.full_name ||
							user.user_metadata?.full_name ||
							user.email?.split('@')[0] ||
							'User',
						email: profileData.email || user.email || '',
						phone: profileData.phone || user.user_metadata?.phone || '',
					})
				} else {
					// Fallback to user metadata
					const userMetadata = user.user_metadata || {}
					setUserProfile({
						name: userMetadata.full_name || user.email?.split('@')[0] || 'User',
						email: user.email || '',
						phone: userMetadata.phone || '',
					})
				}
			} catch (error) {
				console.error('Error fetching user profile:', error)
				// Fallback to user metadata on error
				const userMetadata = user.user_metadata || {}
				setUserProfile({
					name: userMetadata.full_name || user.email?.split('@')[0] || 'User',
					email: user.email || '',
					phone: userMetadata.phone || '',
				})
			} finally {
				setProfileLoading(false)
			}
		}

		if (user && session) {
			fetchUserProfile()
		}
	}, [user, session])

	// Fetch available times when date changes
	useEffect(() => {
		const fetchAvailableTimes = async () => {
			if (!selectedDate) {
				setScheduleOptions([])
				setLoadingTimes(false)
				return
			}

			setLoadingTimes(true)
			try {
				const availableTimes = await getAvailableTimes(selectedDate)
				setScheduleOptions(availableTimes)

				// Clear selected time if it's no longer available
				setSelectedTime((currentTime) => {
					if (currentTime && !availableTimes.find((time) => time.id === currentTime)) {
						// Clear the select element
						const timeSelect = document.getElementById('date-time') as HTMLSelectElement
						if (timeSelect) {
							timeSelect.value = ''
						}
						return ''
					}
					return currentTime
				})
			} catch (error) {
				console.error('Error fetching available times:', error)
				// Fallback to all available schedule options
				const options = getSchedule().filter((value) => value.available === true)
				setScheduleOptions(options)
			} finally {
				setLoadingTimes(false)
			}
		}

		fetchAvailableTimes()
	}, [selectedDate])

	const handleSubmit = (event: preact.JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault()

		if (!userProfile) {
			window.toast({
				dismissible: true,
				title: 'User profile not loaded',
				location: 'bottom-center',
				type: 'error',
				icon: true,
			})
			return
		}

		const { elements } = event.currentTarget
		const termsCheckbox = elements.namedItem('date-agree') as HTMLInputElement
		if (!termsCheckbox.checked) {
			window.toast({
				dismissible: true,
				title: i18n.ACCEPT_TERMS,
				location: 'bottom-center',
				type: 'warning',
				icon: true,
			})

			return
		}

		if (sending) return

		const dateReason = elements.namedItem('date-reason') as HTMLInputElement
		const dateAccessories = elements.namedItem('date-accessories') as HTMLInputElement
		const datePeople = elements.namedItem('date-people') as HTMLInputElement
		const dateOutfits = elements.namedItem('date-outfits') as HTMLInputElement
		const dateDate = elements.namedItem('date-date') as HTMLInputElement
		const dateTime = elements.namedItem('date-time') as HTMLInputElement
		const dateMode = elements.namedItem('date-mode') as HTMLInputElement
		const dateStatus = elements.namedItem('date-status') as HTMLInputElement

		const uid = `${dateDate.value.toLowerCase()}-${dateTime.value.toLowerCase()}-${userProfile.email.toLowerCase()}`
		const status = dateStatus.checked ? DateStatus.CONFIRMED : DateStatus.PENDING

		sendSchedule(
			{
				uuid: uid,
				name: userProfile.name,
				phone: userProfile.phone,
				email: userProfile.email.toLowerCase(),
				date: dateDate.value,
				time: dateTime.value,
				reason: dateReason.value,
				accessories: dateAccessories.value,
				people: datePeople.value ? parseInt(datePeople.value) : 1,
				outfits: dateOutfits.value ? parseInt(dateOutfits.value) : 1,
				mode: dateMode.value,
				status,
			},
			currentLocale,
			() => {
				if (formRef.current) {
					formRef.current.reset()
					setSelectedDate(getInitialDate())
					setSelectedTime('')
				}
			}
		)
	}

	// Show loading state while checking authentication or loading profile
	if (authLoading || profileLoading || !userProfile) {
		return (
			<div className='flex w-full items-center justify-center py-12'>
				<Loading classes='size-8 text-accent' />
			</div>
		)
	}

	return (
		<div className='w-full'>
			{/* Header Tabs */}
			<div className='mb-6 flex overflow-hidden rounded-t-xl border-b border-accent/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm'>
				<div className='flex flex-1 items-center gap-2 px-6 py-4'>
					<ScheduleGlobe classes='text-accent' />
					<span className='font-semibold text-accent'>{i18n.WEB_SCHEDULE}</span>
				</div>
				<a
					href={businessWhatsApp}
					target='_blank'
					rel='noreferrer noopener'
					className='flex items-center gap-2 border-l border-accent/20 bg-green-800/20 px-6 py-4 transition-colors hover:bg-green-800/30'
				>
					<WhatsAppIcon classes='size-5 text-green-400' />
					<span className='font-medium text-green-400'>WhatsApp</span>
				</a>
			</div>

			{/* User Info Card */}
			<div className='mb-6 rounded-xl border border-accent/20 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-4 backdrop-blur-sm'>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent'>
						<UserCircle classes='size-5' />
					</div>
					<div className='flex-1'>
						<p className='font-semibold text-primary'>{userProfile.name}</p>
						<p className='text-sm text-slate-400'>{userProfile.email}</p>
					</div>
				</div>
			</div>

			{/* Form Card */}
			<div className='rounded-xl border border-accent/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 shadow-xl backdrop-blur-sm'>
				<p className='mb-6 text-sm font-light italic text-slate-400'>*{i18n.DATES_ADVICE}</p>

				<form ref={formRef} onSubmit={handleSubmit} className='flex w-full flex-col gap-6'>
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
						{/* Left Column - Date & Time */}
						<div className='flex flex-col gap-5'>
							{/* Phone Number - Readonly */}
							<div className='group relative'>
								<label
									for='date-phone-display'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.PHONE}
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<PhoneCall classes='size-[18px]' />
									</div>
									<input
										type='tel'
										name='date-phone-display'
										id='date-phone-display'
										value={userProfile.phone || 'Not provided'}
										readOnly
										className='w-full cursor-default rounded-md border border-slate-600/30 bg-slate-700/50 px-4 py-3 pl-11 text-sm text-slate-500 outline-none transition-all focus:outline-none'
									/>
								</div>
							</div>

							{/* Date */}
							<div className='group relative'>
								<label
									for='date-date'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.DATE} <span className='text-accent'>*</span>
								</label>
								<DatePicker
									id='date-date'
									name='date-date'
									value={selectedDate}
									minDate={getMinDate()}
									maxDate={format(maxDate)}
									onChange={(value) => {
										setSelectedDate(value)
										setSelectedTime('') // Clear time when date changes
									}}
									required
									currentLocale={currentLocale}
								/>
							</div>

							{/* Hour */}
							<div className='group relative'>
								<label
									for='date-time'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.HOUR} <span className='text-accent'>*</span>
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<Clock classes='size-[18px]' />
									</div>
									{loadingTimes ? (
										<div className='flex w-full items-center justify-center rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-sm text-slate-400'>
											<Loading classes='size-4' />
											<span className='ml-2'>{i18n.LOADING_AVAILABLE_TIMES}</span>
										</div>
									) : scheduleOptins.length === 0 ? (
										<div className='w-full rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-sm text-slate-500'>
											{i18n.NO_AVAILABLE_TIMES}
										</div>
									) : (
										<select
											required
											name='date-time'
											id='date-time'
											value={selectedTime}
											onChange={(e) => setSelectedTime(e.currentTarget.value)}
											className='w-full appearance-none rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 pr-10 text-sm text-primary outline-none transition-all hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
										>
											<option value='' className='bg-slate-800'>
												{i18n.SELECT_TIME}
											</option>
											{scheduleOptins.map((option) => (
												<option key={option.id} value={option.id} className='bg-slate-800'>
													{option.hour}
												</option>
											))}
										</select>
									)}
									{!loadingTimes && scheduleOptins.length > 0 && (
										<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
											<ChevronDown classes='size-4' />
										</div>
									)}
								</div>
							</div>

							{/* Reason */}
							<div className='group relative'>
								<label
									for='date-reason'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.REASON} <span className='text-accent'>*</span>
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<MessageCircle classes='size-[18px]' />
									</div>
									<select
										required
										name='date-reason'
										id='date-reason'
										className='w-full appearance-none rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 pr-10 text-sm text-primary outline-none transition-all hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
									>
										{getReasons(currentLocale).map((reason) => (
											<option key={reason.id} value={reason.id} className='bg-slate-800'>
												{reason.option}
											</option>
										))}
									</select>
									<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<ChevronDown classes='size-4' />
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Details */}
						<div className='flex flex-col gap-5'>
							{/* Modality */}
							<div className='group relative'>
								<label
									for='date-mode'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.MODALITY} <span className='text-accent'>*</span>
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<Monitor classes='size-[18px]' />
									</div>
									<select
										required
										name='date-mode'
										id='date-mode'
										className='w-full appearance-none rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 pr-10 text-sm text-primary outline-none transition-all hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
									>
										<option value='time' className='bg-slate-800'>
											{i18n.SHEDULE_TYPE_TIME}
										</option>
										<option value='digital' className='bg-slate-800'>
											{i18n.SHEDULE_TYPE_DIGITAL}
										</option>
										<option value='both' className='bg-slate-800'>
											{i18n.SHEDULE_TYPE_BOTH}
										</option>
									</select>
									<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<ChevronDown classes='size-4' />
									</div>
								</div>
							</div>

							{/* People */}
							<div className='group relative'>
								<label
									for='date-people'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.PEOPLE} <span className='text-accent'>*</span>
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<Users classes='size-[18px]' />
									</div>
									<input
										required
										type='number'
										name='date-people'
										id='date-people'
										placeholder='1-10'
										min={1}
										max={10}
										className='w-full rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-sm text-primary outline-none transition-all placeholder:text-slate-500/70 hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
									/>
								</div>
							</div>

							{/* Outfits */}
							<div className='group relative'>
								<label
									for='date-outfits'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.OUTFITS} <span className='text-accent'>*</span>
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<Tag classes='size-[18px]' />
									</div>
									<input
										required
										type='number'
										name='date-outfits'
										id='date-outfits'
										placeholder='1'
										min={1}
										className='w-full rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-sm text-primary outline-none transition-all placeholder:text-slate-500/70 hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
									/>
								</div>
							</div>

							{/* Accessories */}
							<div className='group relative'>
								<label
									for='date-accessories'
									className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors group-focus-within:text-accent'
								>
									{i18n.ACCESSORIES}
								</label>
								<div className='relative'>
									<div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
										<Package classes='size-[18px]' />
									</div>
									<input
										type='text'
										name='date-accessories'
										id='date-accessories'
										placeholder={i18n.ACCESSORIES_PLACEHOLDER}
										autoCapitalize='words'
										className='w-full rounded-md border border-slate-600/40 bg-slate-800/30 px-4 py-3 pl-11 text-sm text-primary outline-none transition-all placeholder:text-slate-500/70 hover:border-slate-500/60 hover:bg-slate-800/40 focus:border-accent/60 focus:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-accent/20'
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Checkboxes */}
					<div className='mt-2 flex flex-col gap-4 rounded-lg border border-slate-600/30 bg-slate-800/30 p-4'>
						<div className='flex items-start gap-3'>
							<input
								id='date-status'
								name='date-status'
								type='checkbox'
								className='mt-1 h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-700 text-accent transition-colors focus:ring-2 focus:ring-accent/20 focus:ring-offset-0'
							/>
							<label for='date-status' className='text-sm font-medium text-slate-300'>
								{i18n.DATE_STATUS}
							</label>
						</div>

						<div className='flex items-start gap-3'>
							<input
								required
								id='date-agree'
								name='date-agree'
								type='checkbox'
								className='mt-1 h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-700 text-accent transition-colors focus:ring-2 focus:ring-accent/20 focus:ring-offset-0'
							/>
							<label for='date-agree' className='text-sm font-medium text-slate-300'>
								*{i18n.SCHEDULE_AGREE_TEXT_1}{' '}
								<a
									href='/terms'
									className='text-accent transition-colors hover:text-secondary hover:underline'
								>
									{i18n.TERMS}
								</a>{' '}
								{i18n.SCHEDULE_AGREE_TEXT_2}{' '}
								<a
									href='/privacy'
									className='text-accent transition-colors hover:text-secondary hover:underline'
								>
									{i18n.PRIVACY}
								</a>{' '}
								{i18n.SCHEDULE_AGREE_TEXT_3}.
							</label>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						disabled={sending}
						className='group relative mt-4 flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-accent to-back px-6 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-accent/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg'
					>
						{sending ? (
							<>
								<Loading classes='size-5' />
								<span>{i18n.SENDING}</span>
							</>
						) : (
							<>
								<CalendarPlus classes='size-5' />
								<span>{i18n.SCHEDULE}</span>
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}
