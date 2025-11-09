/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'preact/hooks'
import { getI18N } from '@/locales/index'
import type { Review } from '@/interfaces/review'
import { supabase } from '@/db/supabase'

export function useReviews() {
	const [sending, setSending] = useState(false)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState(false)
	const [allReviews, setAllReviews] = useState<Review[]>([])
	const [reviewsCount, setReviewsCount] = useState(0)
	const [reviewsShowing, setReviewsShowing] = useState(5)

	const fetchReviews = async (limit: number, offset: number = 0) => {
		const res = await fetch('/api/db/get-reviews', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ limit, offset }),
		})

		const { data, count, error }: { data: Review[]; count: number; error: any } = await res.json()

		if (error) {
			console.error('Error fetching reviews:', error)
			return { data: [], count: 0 }
		}

		return { data: data || [], count: count || 0 }
	}

	// Initial load
	useEffect(() => {
		const loadInitialReviews = async () => {
			setLoading(true)
			const { data, count } = await fetchReviews(reviewsShowing, 0)
			setAllReviews(data)
			setReviewsCount(count)
			setLoading(false)
		}
		loadInitialReviews()
	}, [])

	// Load more reviews
	const loadMoreReviews = async () => {
		if (loadingMore || allReviews.length >= reviewsCount) return

		setLoadingMore(true)
		const currentCount = allReviews.length
		const loadAmount = 5

		const { data, count } = await fetchReviews(loadAmount, currentCount)

		// Append new reviews to existing ones
		setAllReviews((prevReviews) => [...prevReviews, ...data])
		setReviewsCount(count)
		setReviewsShowing(currentCount + loadAmount)
		setLoadingMore(false)
	}

	// Refresh reviews (useful after submitting a new review)
	// This doesn't set loading to avoid hiding existing reviews
	const refreshReviews = async () => {
		const { data, count } = await fetchReviews(reviewsShowing, 0)
		setAllReviews(data)
		setReviewsCount(count)
	}

	const sendReview = async (
		reviewData: Review,
		currentLocale: string | undefined = 'es',
		callback: () => void
	) => {
		const i18n = getI18N({ currentLocale })

		setSending(true)
		setError(true)

		try {
			// Validate the review data
			if (reviewData.title.length < 5 || reviewData.title.length > 40) {
				throw new Error('Error sending date')
			}

			if (reviewData.rating < 1 || reviewData.rating > 5) {
				throw new Error('Error sending date')
			}

			// Get the session token from Supabase
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (!session) {
				throw new Error('Not authenticated')
			}

			// Insert the review into the database with authentication
			const response = await fetch('/api/db/insert-review', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({
					rating: reviewData.rating,
					title: reviewData.title,
					description: reviewData.description,
					image: reviewData.image,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error(i18n.AUTH_REQUIRED || 'Please sign in to submit a review')
				}
				throw new Error(result.error || result.message || 'Error sending date')
			}

			window.toast({
				dismissible: true,
				title: i18n.REVIEW_INSERTED,
				location: 'bottom-center',
				type: 'success',
				icon: true,
			})

			callback?.()

			setTimeout(() => {
				refreshReviews()
			}, 500)
		} catch (error: any) {
			window.toast({
				dismissible: true,
				title: error.message || i18n.REVIEW_ERROR,
				location: 'bottom-center',
				type: 'error',
				icon: true,
			})

			console.error('Error sending review:', error)
			setError(true)
		} finally {
			setSending(false)
		}
	}

	return {
		allReviews,
		reviewsCount,
		sending,
		error,
		loading,
		loadingMore,
		reviewsShowing,
		setError,
		sendReview,
		setReviewsShowing,
		loadMoreReviews,
	}
}
