/* eslint-disable react/react-in-jsx-scope */

import { Dashboard } from '@/icons/Dashboard'
import { Search } from '@/icons/Search'
import { SemiArrow } from '@/icons/SemiArrow'
import { useCallback, useState, useEffect, useRef } from 'preact/hooks'
import debounce from 'just-debounce-it'
import { useDashboardTableDates } from '@/hooks/useDashboardTableDates'
import { useSearch } from '@/hooks/useSearch'
import { DashboardDataRows } from '@/components/DashboardDataRows'
import { getI18N } from '@/locales/index'
import { SortAscendingNumbers } from '@/icons/SortAscendingNumbers'
import { SortAscending } from '@/icons/SortAscending'
import { Loading } from '@/icons/Loading'
import type { Date } from '@/interfaces/date'
import { Trash } from '@/icons/Trash'
import { Save } from '@/icons/Save'
import { DateStatus } from '@/interfaces/dateStatus'
import { Close } from '@/icons/Close'
import { useConvert } from '@/hooks/useConvert'

export const DashboardDataTable = ({
	numberOfDates,
	currentLocale,
}: {
	numberOfDates: number
	currentLocale?: string
}) => {
	const i18n = getI18N({ currentLocale })
	const [isViewOpen, setIsViewOpen] = useState(false)
	const { search, setSearch } = useSearch()
	const [isRowInfoOpen, setIsRowInfoOpen] = useState(false)
	const [rowInfo, setRowInfo] = useState<Date>({ time: '-' } as Date)
	const { convertMode, convertReason } = useConvert(currentLocale)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const {
		dates,
		loading,
		nameSort,
		timeSort,
		statusSort,
		page,
		todaysSort,
		tomorrowsSort,
		totalCount,
		totalPages,
		saving,
		datesShowing,
		dateSort,
		setDateSort,
		setNameSort,
		setTimeSort,
		setStatusSort,
		setTodaysSort,
		setTomorrowsSort,
		setSearching,
		setPage,
		saveCurrentDate,
		deleteDate,
	} = useDashboardTableDates({
		numberOfDates,
		search,
	})

	const debouncedGetDates = useCallback(
		debounce((newSarch: string | null) => {
			setSearch(newSarch)
			setSearching(false)
		}, 600),
		[setSearch]
	)

	const handleChange = (event: preact.JSX.TargetedEvent<HTMLInputElement, Event>) => {
		event.preventDefault()

		const element = event.target as HTMLInputElement
		const newSearch = element.value

		setSearching(true)
		debouncedGetDates(newSearch)
	}

	const handleClickRow = (event: preact.JSX.TargetedEvent<HTMLTableRowElement, Event>) => {
		event.preventDefault()
		const element = event.currentTarget as HTMLTableRowElement
		const row = element.dataset.row
		const rowData = dates.find((date) => date.uuid === row)
		if (rowData) {
			setRowInfo(rowData)
			setIsRowInfoOpen((prev) => !prev)
			document.body.style.overflowY = isRowInfoOpen ? 'auto' : 'hidden'
		}
	}

	const handleClickInfoModal = (
		event: preact.JSX.TargetedEvent<HTMLDivElement | HTMLSpanElement, Event>
	) => {
		event.preventDefault()
		const element = event.currentTarget as HTMLElement
		const row = element.id
		if (row === 'row-info-modal' || row === 'row-close-modal') {
			if (!saving) {
				setIsRowInfoOpen((prev) => !prev)
				document.body.style.overflowY = isRowInfoOpen ? 'auto' : 'hidden'
				setRowInfo({ time: '-' } as Date)
			}
		}
	}

	const closeModal = () => {
		if (!saving) {
			setIsRowInfoOpen((prev) => !prev)
			document.body.style.overflowY = isRowInfoOpen ? 'auto' : 'hidden'
			setRowInfo({ time: '-' } as Date)
		}
	}

	const handleSaving = (event: preact.JSX.TargetedEvent<HTMLButtonElement, Event>) => {
		event.preventDefault()

		saveCurrentDate(rowInfo.status, rowInfo.uuid, currentLocale)
		closeModal()
	}

	const handleDelete = (event: preact.JSX.TargetedEvent<HTMLButtonElement, Event>) => {
		event.preventDefault()

		if (!confirm(i18n.CONFIRM_DELETE)) return

		deleteDate(rowInfo.uuid)
		closeModal()
	}

	const handlUpdateRowInfoStatus = (event: preact.JSX.TargetedEvent<HTMLSelectElement, Event>) => {
		event.preventDefault()
		const element = event.currentTarget as HTMLSelectElement
		const newStatus = element.value as DateStatus
		setRowInfo((prev) => ({ ...prev, status: newStatus }))
	}

	const handleViewToggle = () => setIsViewOpen((prev) => !prev)
	const handleNextPage = () => setPage((p) => p + 1)
	const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1))
	const handlePageOne = () => setPage(1)
	const handleNameSort = () => setNameSort((prev) => !prev)
	const handleTimeSort = () => setTimeSort((prev) => !prev)
	const handleStatusSort = () => setStatusSort((prev) => !prev)
	const handleDateSort = () => setDateSort((prev) => !prev)
	const handleAllDatesSort = () => {
		setTodaysSort(false)
		setTomorrowsSort(false)
		handleViewToggle()
	}
	const handleTodaysSort = () => {
		setTodaysSort((prev) => !prev)
		setTomorrowsSort(false)
		handleViewToggle()
	}
	const handleTomorrowsSort = () => {
		setTomorrowsSort((prev) => !prev)
		setTodaysSort(false)
		handleViewToggle()
	}

	const handleLogout = () => {
		window.location.href = '/api/logout'
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsViewOpen(false)
			}
		}

		if (isViewOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isViewOpen])

	return (
		<>
			{/* Modern Modal */}
			<div
				id={'row-info-modal'}
				onClick={handleClickInfoModal}
				className={`fixed inset-0 z-50 flex ${isRowInfoOpen ? 'visible' : 'invisible'} h-screen w-screen items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isRowInfoOpen ? 'opacity-100' : 'opacity-0'}`}
			>
				<div
					onClick={(e) => e.stopPropagation()}
					className={`relative flex h-fit max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-back via-back to-back/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 ease-out sm:p-6 lg:p-8 ${isRowInfoOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'} mx-4`}
				>
					{/* Header */}
					<div className='mb-6 flex w-full items-center justify-between border-b border-white/10 pb-4'>
						<div className='flex items-center gap-3'>
							<div className='flex items-center gap-2'>
								<h3 className='text-xl font-bold text-primary sm:text-2xl'>{rowInfo.name}</h3>
								{rowInfo.status === DateStatus.DONE ? (
									<span
										title={i18n.DONE}
										className='size-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50'
									></span>
								) : rowInfo.status === DateStatus.PENDING ? (
									<span
										title={i18n.PENDING}
										className='size-3 rounded-full bg-gray-500 shadow-lg shadow-gray-500/50'
									></span>
								) : rowInfo.status === DateStatus.CANCELLED ? (
									<span
										title={i18n.CANCELLED}
										className='size-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50'
									></span>
								) : rowInfo.status === DateStatus.OVERDUE ? (
									<span
										title={i18n.OVERDUE}
										className='size-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50'
									></span>
								) : (
									<span
										title={i18n.CONFIRMED}
										className='size-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50'
									></span>
								)}
							</div>
						</div>

						<button
							id={'row-close-modal'}
							onClick={handleClickInfoModal}
							className='group flex size-10 cursor-pointer items-center justify-center rounded-lg text-primary transition-all duration-200 hover:bg-white/10 hover:text-accent active:scale-95'
							aria-label='Close modal'
						>
							<Close classes='size-5' />
						</button>
					</div>

					{/* Content - Scrollable */}
					<div className='flex-1 space-y-6 overflow-y-auto pr-2 sm:pr-4'>
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.EMAIL}
								</span>
								<span className='block break-all text-base font-medium text-primary'>
									{rowInfo.email}
								</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.PHONE}
								</span>
								<span className='block text-base font-medium text-primary'>{rowInfo.phone}</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.DATE}
								</span>
								<span className='block text-base font-medium text-primary'>{rowInfo.date}</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.TIME}
								</span>
								<span className='block text-base font-medium text-primary'>
									{rowInfo.time.replace('-', ':')}
								</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.MODE}
								</span>
								<span className='block text-base font-medium text-primary'>
									{convertMode(rowInfo.mode)}
								</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.PEOPLE}
								</span>
								<span className='block text-base font-medium text-primary'>{rowInfo.people}</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.OUTFITS}
								</span>
								<span className='block text-base font-medium text-primary'>{rowInfo.outfits}</span>
							</div>

							<div className='group rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.ACCESSORIES}
								</span>
								<span className='block text-base font-medium text-primary'>
									{rowInfo.accessories}
								</span>
							</div>

							<div className='group col-span-1 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg sm:col-span-2'>
								<span className='mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.REASON}
								</span>
								<p className='whitespace-pre-wrap text-base font-medium text-primary'>
									{convertReason(rowInfo.reason)}
								</p>
							</div>

							<div className='group col-span-1 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg sm:col-span-2'>
								<span className='mb-3 block text-xs font-semibold uppercase tracking-wider text-secondary'>
									{i18n.STATUS}
								</span>
								<select
									onChange={handlUpdateRowInfoStatus}
									name='date-status'
									defaultValue={rowInfo.status}
									className='w-full rounded-xl border border-white/20 bg-white/10 p-3 text-base font-medium text-primary outline-none backdrop-blur-sm transition-all placeholder:text-slate-500 focus:border-accent focus:bg-white/15 focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 focus:ring-offset-back'
								>
									<option className='bg-back text-primary' value={DateStatus.CONFIRMED}>
										{i18n.CONFIRMED}
									</option>
									<option className='bg-back text-primary' value={DateStatus.DONE}>
										{i18n.DONE}
									</option>
									<option className='bg-back text-primary' value={DateStatus.PENDING}>
										{i18n.PENDING}
									</option>
									<option className='bg-back text-primary' value={DateStatus.OVERDUE}>
										{i18n.OVERDUE}
									</option>
									<option className='bg-back text-primary' value={DateStatus.CANCELLED}>
										{i18n.CANCELLED}
									</option>
								</select>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className='mt-6 flex w-full flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end'>
						<button
							onClick={handleDelete}
							type='button'
							disabled={saving}
							className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-base font-semibold transition-all duration-200 sm:flex-initial ${!saving ? 'cursor-pointer border border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300 active:scale-95' : 'cursor-not-allowed border border-red-900/30 bg-red-900/10 text-red-900/50'}`}
						>
							<span className='relative flex items-center gap-2'>
								<Trash classes='size-5' />
								{i18n.DELETE}
							</span>
						</button>

						<button
							type='button'
							disabled={saving}
							onClick={handleSaving}
							className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-main px-6 py-3 text-base font-semibold text-white shadow-lg shadow-main/30 transition-all duration-200 hover:shadow-xl hover:shadow-main/40 active:scale-95 sm:flex-initial ${saving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
						>
							<span className='relative flex items-center gap-2'>
								{!saving ? <Save classes='size-5' /> : <Loading classes='size-5 animate-spin' />}
								{!saving ? i18n.SAVE : i18n.SAVING}
							</span>
						</button>
					</div>
				</div>
			</div>

			<div className='flex w-full max-w-6xl flex-col'>
				{/* Header Section */}
				<div className='mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-main/20 backdrop-blur-sm'>
							<Dashboard classes='size-6 text-accent' />
						</div>
						<h2 className='bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl'>
							{i18n.DASHBOARD}
						</h2>
					</div>
				</div>

				{/* Controls Section */}
				<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='relative' ref={dropdownRef}>
						<button
							onClick={handleViewToggle}
							className='relative inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-primary backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-white/10 hover:shadow-lg hover:shadow-accent/10 focus:outline-none focus:ring-2 focus:ring-accent/20 active:scale-95'
							type='button'
							aria-expanded={isViewOpen}
							aria-haspopup='true'
						>
							<span>
								{todaysSort
									? i18n.TODAYs_DATES
									: tomorrowsSort
										? i18n.TOMORROWs_DATES
										: i18n.ALL_DATES}
							</span>
							<SemiArrow
								classes={`size-3 transition-transform duration-200 ${isViewOpen ? '' : 'rotate-180'}`}
							/>
						</button>

						<div
							className={`absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-white/20 bg-back/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${isViewOpen ? 'visible translate-y-0 opacity-100' : 'pointer-events-none invisible -translate-y-2 opacity-0'}`}
							role='menu'
						>
							<ul className='py-1 text-sm text-primary'>
								<li
									onClick={handleAllDatesSort}
									className='cursor-pointer select-none px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-accent'
								>
									{i18n.ALL_DATES}
								</li>
								<li
									onClick={handleTodaysSort}
									className='cursor-pointer select-none px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-accent'
								>
									{i18n.TODAYs_DATES}
								</li>
								<li
									onClick={handleTomorrowsSort}
									className='cursor-pointer select-none px-4 py-2.5 transition-colors hover:bg-white/10 hover:text-accent'
								>
									{i18n.TOMORROWs_DATES}
								</li>
								<li className='my-1 border-t border-white/10'></li>
								<li
									onClick={handleLogout}
									className='cursor-pointer select-none px-4 py-2.5 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300'
								>
									{i18n.LOGOUT}
								</li>
							</ul>
						</div>
					</div>

					<label className='relative'>
						<div className='pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center ps-4'>
							<Search classes='size-4 text-secondary' />
						</div>
						<input
							onKeyUp={handleChange}
							type='text'
							id='table-search-users'
							className='block w-full rounded-xl border border-white/20 bg-white/5 p-3 ps-11 text-primary outline-none backdrop-blur-sm transition-all placeholder:text-slate-500 focus:border-accent/50 focus:bg-white/10 focus:ring-2 focus:ring-accent/20 sm:w-80'
							placeholder='Search for dates...'
						/>
					</label>
				</div>

				{/* Table Container with Glass Morphism */}
				<div className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left text-sm text-primary'>
							<thead className='border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider'>
								<tr>
									<th scope='col' className='select-none px-4 py-4 font-semibold text-secondary'>
										#
									</th>
									<th
										scope='col'
										className={`select-none items-center px-4 py-4 font-semibold transition-colors ${nameSort ? 'text-accent' : 'text-secondary'}`}
									>
										<button
											onClick={handleNameSort}
											className='inline-flex items-center gap-2 hover:text-accent focus:outline-none'
										>
											{i18n.NAME}
											<SortAscending
												classes={`size-4 transition-all ${nameSort ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}
											/>
										</button>
									</th>
									<th
										scope='col'
										className='hidden select-none px-4 py-4 font-semibold text-secondary sm:table-cell'
									>
										{i18n.PHONE}
									</th>
									<th
										scope='col'
										className={`select-none items-center px-4 py-4 font-semibold transition-colors ${dateSort ? 'text-accent' : 'text-secondary'}`}
									>
										<button
											onClick={handleDateSort}
											className='inline-flex items-center gap-2 hover:text-accent focus:outline-none'
										>
											{i18n.DATE}
											<SortAscendingNumbers
												classes={`size-4 transition-all ${dateSort ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}
											/>
										</button>
									</th>
									<th
										scope='col'
										className={`select-none items-center px-4 py-4 font-semibold transition-colors ${timeSort ? 'text-accent' : 'text-secondary'}`}
									>
										<button
											onClick={handleTimeSort}
											className='inline-flex items-center gap-2 hover:text-accent focus:outline-none'
										>
											{i18n.TIME}
											<SortAscendingNumbers
												classes={`size-4 transition-all ${timeSort ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}
											/>
										</button>
									</th>
									<th
										scope='col'
										className='hidden select-none px-4 py-4 font-semibold text-secondary md:table-cell'
									>
										{i18n.MODE}
									</th>
									<th
										scope='col'
										className={`select-none items-center px-4 py-4 font-semibold transition-colors ${statusSort ? 'text-accent' : 'text-secondary'}`}
									>
										<button
											onClick={handleStatusSort}
											className='inline-flex items-center gap-2 hover:text-accent focus:outline-none'
										>
											{i18n.STATUS}
											<span
												className={`size-3 rounded-full bg-orange-500 transition-all ${statusSort ? 'scale-100 opacity-100' : 'scale-90 opacity-40'}`}
											></span>
										</button>
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-white/5'>
								{dates.length > 0 &&
									!loading &&
									dates.map((row, idx) => (
										<DashboardDataRows
											onClick={handleClickRow}
											data_row={row.uuid}
											key={row.uuid}
											idx={(page - 1) * datesShowing + idx + 1}
											name={row.name}
											date={row.date}
											time={row.time.replace('-', ':')}
											status={row.status}
											mode={convertMode(row.mode)}
											phone={row.phone}
										/>
									))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				{!loading && totalCount > dates.length && (
					<div className='mt-6 flex flex-wrap items-center justify-center gap-2'>
						<button
							onClick={handlePrevPage}
							disabled={page === 1}
							type='button'
							className='flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-primary transition-all hover:border-accent/50 hover:bg-white/10 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:bg-white/5 disabled:hover:text-primary'
							aria-label='Previous page'
						>
							<SemiArrow classes='size-4 -rotate-90' />
						</button>

						{page > 2 && (
							<button
								className='cursor-pointer select-none rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:border-accent/50 hover:bg-white/10 hover:text-accent'
								onClick={handlePageOne}
								type='button'
							>
								1 ...
							</button>
						)}

						<span className='flex size-9 items-center justify-center rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent'>
							{page}
						</span>

						{page < totalPages && (
							<button
								onClick={handleNextPage}
								type='button'
								className='flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-primary transition-all hover:border-accent/50 hover:bg-white/10 hover:text-accent'
								aria-label='Next page'
							>
								<SemiArrow classes='size-4 rotate-90' />
							</button>
						)}
					</div>
				)}

				{/* Loading State */}
				<div
					className={`inline-flex w-full items-center justify-center py-12 ${!loading ? 'hidden' : ''}`}
				>
					<div className='flex flex-col items-center gap-4'>
						<Loading classes='size-10 animate-spin text-accent' />
						<span className='text-sm text-secondary'>Loading dates...</span>
					</div>
				</div>

				{/* Empty State */}
				<div
					className={`flex flex-col items-center justify-center py-12 ${dates.length === 0 && !loading ? '' : 'hidden'}`}
				>
					<div className='rounded-full bg-white/5 p-4'>
						<Search classes='size-8 text-secondary' />
					</div>
					<p className='mt-4 text-center text-base font-medium text-secondary'>
						{i18n.NO_DATES_TO_SHOW}
					</p>
				</div>
			</div>
		</>
	)
}
