/* eslint-disable react/react-in-jsx-scope */
import { getI18N } from '@/locales/index'
import { useEmailjs } from '@/hooks/useEmailjs'
import { useRef } from 'preact/hooks'
import { Loading } from '@/icons/Loading'
import { businessEmail } from '@/libs/consts'

export const SendForm = ({ currentLocale }: { currentLocale?: string }) => {
	const { sending, sendEmail } = useEmailjs()
	const formRef = useRef<HTMLFormElement | null>(null)
	const i18n = getI18N({ currentLocale })

	const handleSubmit = (event: preact.JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault()
		if (sending) return

		const { elements } = event.currentTarget
		const userNameInput = elements.namedItem('user_name') as HTMLInputElement
		const userEmailInput = elements.namedItem('user_email') as HTMLInputElement
		const messageInput = elements.namedItem('message') as HTMLInputElement

		sendEmail(
			{
				user_name: userNameInput.value,
				user_email: userEmailInput.value,
				message: messageInput.value,
			},
			currentLocale,
			() => {
				if (formRef.current) {
					formRef.current.reset()
				}
			}
		)
	}

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			className='rounded-2xl border border-accent/10 bg-glass p-6 shadow-lg backdrop-blur-md'
		>
			<span className='text-sm font-medium italic text-secondary'>{i18n.CONTACT_TXT_6}</span>

			<div className='mt-4 flex flex-col gap-4'>
				<label className='inline-flex flex-col gap-2'>
					<span className='text-sm font-semibold text-primary'>{i18n.NAME}*</span>
					<input
						required
						autoComplete='name'
						className='h-12 rounded-xl border border-accent/20 bg-back/50 px-4 text-primary outline-none transition-all duration-300 placeholder:text-secondary/50 focus:border-accent/60 focus:bg-back/70 focus:ring-2 focus:ring-accent/20'
						type='text'
						name='user_name'
						placeholder='Jane Doe'
					/>
				</label>

				<label className='inline-flex flex-col gap-2'>
					<span className='text-sm font-semibold text-primary'>{i18n.EMAIL}*</span>
					<input
						required
						autoComplete='email'
						className='h-12 rounded-xl border border-accent/20 bg-back/50 px-4 text-primary outline-none transition-all duration-300 placeholder:text-secondary/50 focus:border-accent/60 focus:bg-back/70 focus:ring-2 focus:ring-accent/20'
						type='email'
						name='user_email'
						placeholder={businessEmail}
					/>
				</label>

				<label className='inline-flex flex-col gap-2'>
					<span className='text-sm font-semibold text-primary'>{i18n.MESSAGE}*</span>
					<textarea
						required
						className='min-h-32 resize-none rounded-xl border border-accent/20 bg-back/50 p-4 text-primary outline-none transition-all duration-300 placeholder:text-secondary/50 focus:border-accent/60 focus:bg-back/70 focus:ring-2 focus:ring-accent/20'
						name='message'
						placeholder={i18n.MESSAGE_PLACEHOLDER}
					></textarea>
				</label>
			</div>

			<button
				type='submit'
				disabled={sending}
				className={`group relative mt-6 flex w-full flex-row items-center justify-center gap-2 overflow-hidden rounded-xl border px-6 py-3 text-lg font-bold transition-all duration-300 ${
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
	)
}
