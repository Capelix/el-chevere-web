/* eslint-disable react/react-in-jsx-scope */
import { getI18N } from '@/locales/index'
import { FilledStar } from '@/icons/FilledStar'
import { Loading } from '@/icons/Loading'
import { useReviews } from '@/hooks/useReviews'
import { useAuth } from '@/hooks/useAuth'
import { useRef } from 'preact/hooks'
import { useState } from 'preact/hooks'
import type { JSX } from 'preact'
import { ReviewCard } from '@/components/ReviewCard'

export const Reviews = ({ currentLocale }: { currentLocale?: string }) => {
	const i18n = getI18N({ currentLocale })
	const formRef = useRef<HTMLFormElement | null>(null)
	const [rating, setRating] = useState(0)
	const { allReviews, reviewsCount, sending, loading, loadingMore, sendReview, loadMoreReviews } =
		useReviews()
	const { user, loading: authLoading } = useAuth()

	const handleSubmit = async (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault()
		if (sending || !user) return

		const { elements } = event.currentTarget
		const reviewTitleInput = elements.namedItem('review_title') as HTMLInputElement
		const messageInput = elements.namedItem('review_message') as HTMLTextAreaElement

		sendReview(
			{
				username: user.email?.split('@')[0] || 'User',
				title: reviewTitleInput.value,
				description: messageInput.value,
				rating: rating,
				image: user.user_metadata?.avatar_url || '/statics/user.svg',
			},
			currentLocale,
			() => {
				if (formRef.current) {
					formRef.current.reset()
				}
				setRating(1)
			}
		)
	}

	const handleRatingClick = (rate: number) => {
		if (sending) return
		setRating(rate)
	}

	return (
		<div className='flex flex-col gap-12'>
			{!authLoading && !user && (
				<div className='rounded-2xl border border-accent/10 bg-glass p-6 shadow-lg backdrop-blur-md'>
					<p className='mb-4 text-center text-primary'>
						{i18n.SIGN_IN_TO_REVIEW || 'Please sign in to submit a review'}
					</p>
					<a
						href='/auth'
						className='group relative mx-auto flex w-full max-w-xs flex-row items-center justify-center gap-2 overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-r from-main to-accent px-6 py-3 text-lg font-bold text-primary shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-105 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/30 active:scale-95'
					>
						{i18n.SIGN_IN || 'Sign In'}
					</a>
				</div>
			)}

			{!authLoading && user && (
				<div className='rounded-2xl border border-accent/10 bg-glass p-6 shadow-lg backdrop-blur-md'>
					<form className='flex flex-col gap-4' ref={formRef} onSubmit={handleSubmit}>
						<label className='inline-flex flex-col gap-2'>
							<span className='text-sm font-semibold text-primary'>{i18n.TITLE}*</span>
							<input
								required
								className='h-12 rounded-xl border border-accent/20 bg-back/50 px-4 text-primary outline-none transition-all duration-300 placeholder:text-secondary/50 focus:border-accent/60 focus:bg-back/70 focus:ring-2 focus:ring-accent/20'
								type='text'
								name='review_title'
								placeholder={i18n.TITLE}
								maxLength={40}
							/>
						</label>

						<label className='inline-flex flex-col gap-2'>
							<span className='text-sm font-semibold text-primary'>{i18n.MESSAGE}*</span>
							<textarea
								required
								className='min-h-28 resize-none rounded-xl border border-accent/20 bg-back/50 p-4 text-primary outline-none transition-all duration-300 placeholder:text-secondary/50 focus:border-accent/60 focus:bg-back/70 focus:ring-2 focus:ring-accent/20'
								name='review_message'
								placeholder={i18n.MESSAGE_PLACEHOLDER}
							></textarea>
						</label>

						<div className='inline-flex flex-col gap-2'>
							<span className='text-sm font-semibold text-primary'>{i18n.RATING}*</span>
							<div className='flex items-center gap-1'>
								{[1, 2, 3, 4, 5].map((star) => (
									<FilledStar
										key={star}
										onClick={() => handleRatingClick(star)}
										classes={`size-6 transition-all duration-300 cursor-pointer hover:scale-110 ${
											rating >= star
												? 'text-warning drop-shadow-lg'
												: 'text-secondary/40 hover:text-warning/60'
										}`}
									/>
								))}
							</div>
						</div>

						<button
							type='submit'
							disabled={sending}
							className={`group relative mt-2 flex w-full max-w-xs flex-row items-center justify-center gap-2 overflow-hidden rounded-xl border px-6 py-3 text-lg font-bold transition-all duration-300 ${
								!sending
									? 'cursor-pointer border-accent/30 bg-gradient-to-r from-main to-accent text-primary shadow-lg shadow-accent/20 hover:scale-105 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/30 active:scale-95'
									: 'cursor-not-allowed border-accent/10 bg-back/50 text-secondary'
							}`}
						>
							<span
								className={`absolute inset-0 bg-gradient-to-r from-accent to-main opacity-0 transition-opacity duration-300 ${
									sending ? '' : 'group-hover:opacity-100'
								}`}
							></span>

							<span className='relative z-10 flex items-center gap-2'>
								{!sending ? (
									<svg
										className='size-5'
										width='800px'
										height='800px'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
										<path d='M10 14l11 -11'></path>
										<path d='M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5'></path>
									</svg>
								) : (
									<Loading classes='size-5' />
								)}
								{`${!sending ? i18n.SEND : i18n.SENDING}`}
							</span>
						</button>
					</form>
				</div>
			)}

			<div className='flex flex-col gap-6'>
				<h2 className='text-2xl font-bold text-primary lg:text-3xl'>
					{i18n.COSTUMERS_REVIEWS}{' '}
					{reviewsCount > 0 && (
						<span className='font-normal text-secondary/70'>(+{reviewsCount})</span>
					)}
				</h2>

				{loading && <Loading classes='size-8 mx-auto text-accent' />}

				{allReviews.length > 0 &&
					!loading &&
					allReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
			</div>

			{allReviews.length < reviewsCount && (
				<button
					onClick={loadMoreReviews}
					disabled={loadingMore}
					className={`group relative mx-auto mt-4 flex w-full max-w-xs items-center justify-center gap-2 overflow-hidden rounded-xl border border-accent/30 bg-glass px-6 py-3 text-lg font-bold text-primary backdrop-blur-md transition-all duration-300 ${
						loadingMore
							? 'cursor-not-allowed opacity-50'
							: 'hover:scale-105 hover:border-accent/60 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/20 active:scale-95'
					}`}
				>
					<span className='absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></span>
					<span className='relative z-10 flex items-center gap-2'>
						{loadingMore && <Loading classes='size-5' />}
						{i18n.SHOW_MORE}
					</span>
				</button>
			)}
		</div>
	)
}
