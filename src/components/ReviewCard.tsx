/* eslint-disable react/react-in-jsx-scope */
import { FilledStar } from '@/icons/FilledStar'
import type { Review } from '@/interfaces/review'

interface Props {
	review: Review
}

const getImageUrl = (imageUrl: string): string => {
	if (!imageUrl) return '/statics/user.svg'

	if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
		return imageUrl
	}

	try {
		new URL(imageUrl) // Validate URL format
		return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
	} catch {
		// If URL parsing fails, return fallback
		return '/statics/user.svg'
	}
}

export const ReviewCard = ({ review }: Props) => {
	return (
		<article
			key={review.id}
			className='group flex flex-col gap-3 rounded-2xl border border-accent/10 bg-glass p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/10'
		>
			<div className='flex items-center gap-4'>
				<img
					className='size-12 rounded-full border-2 border-accent/20 object-cover transition-all duration-300 group-hover:scale-105 group-hover:border-accent/40'
					src={getImageUrl(review.image)}
					alt={review.username}
					loading='lazy'
					decoding='async'
					onError={(e) => {
						const target = e.target as HTMLImageElement
						if (!target.src.includes('/statics/user.svg')) {
							target.src = '/statics/user.svg'
							target.onerror = null
						}
					}}
				/>
				<div className='flex-1'>
					<p className='font-semibold text-primary'>{review.username}</p>
					<div className='mt-1 flex flex-col gap-1 md:flex-row md:items-center'>
						<div className='flex gap-1'>
							{[1, 2, 3, 4, 5].map((star) => (
								<FilledStar
									key={star}
									classes={`size-4 ${
										review.rating >= star ? 'text-warning drop-shadow-md' : 'text-secondary/30'
									}`}
								/>
							))}
						</div>
						<h3 className='text-base font-semibold text-primary md:ml-2'>{review.title}</h3>
					</div>
				</div>
			</div>

			<p className='text-base leading-relaxed text-secondary'>&quot;{review.description}&quot;</p>
		</article>
	)
}
