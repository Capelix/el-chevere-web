import { useLogin } from '@/hooks/useLogin'
import { Loading } from '@/icons/Loading'
import { Login } from '@/icons/Login'
import { PasswordUser } from '@/icons/PasswordUser'
import { User } from '@/icons/User'
import { getI18N } from '@/locales/index'
import { useRef } from 'preact/hooks'

/* eslint-disable react/react-in-jsx-scope */
export const LoginForm = ({ currentLocale }: { currentLocale?: string }) => {
	const { isLogin, sendLogin } = useLogin()
	const formRef = useRef<HTMLFormElement | null>(null)
	const i18n = getI18N({ currentLocale })

	const handleSubmit = (event: preact.JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault()

		const { elements } = event.currentTarget
		const usernameInput = elements.namedItem('username') as HTMLInputElement
		const passwordInput = elements.namedItem('password') as HTMLInputElement

		sendLogin(
			{
				username: usernameInput.value,
				password: passwordInput.value,
			},
			currentLocale
		)
	}

	return (
		<div className={`flex w-full items-center justify-center`}>
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className='flex w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-accent/5 p-6 shadow-lg'
			>
				<img
					src='https://www.fotoestudioelchevere.com/logo-no-name.png'
					srcSet='https://www.fotoestudioelchevere.com/logo-no-name.png'
					alt='Logo Foto Estudio El Chévere'
					loading='lazy'
					decoding='async'
					className={`mb-4 max-w-40 select-none transition-all duration-300 ease-in-out hover:scale-105`}
				/>
				<div className='mb-4'>
					<label className='mb-1 inline-flex flex-col text-secondary' htmlFor='username'>
						{i18n.USERNAME}
						<div className='flex'>
							<span className={`inline-flex h-10 items-center rounded-s-lg bg-accent/20 px-3`}>
								<User classes='size-5' />
							</span>

							<input
								className='h-10 rounded-e-lg bg-accent/10 p-2 text-primary outline-none transition-all placeholder:text-slate-500 focus:outline-1 focus:outline-main'
								id='username'
								type='text'
								placeholder='el_chévere'
							/>
						</div>
					</label>
				</div>
				<div className='mb-6'>
					<label className='mb-1 inline-flex flex-col text-secondary' htmlFor='password'>
						{i18n.PASSWORD}
						<div className='flex'>
							<span className={`inline-flex h-10 items-center rounded-s-lg bg-accent/20 px-3`}>
								<PasswordUser classes='size-5' />
							</span>

							<input
								className='h-10 rounded-e-lg bg-accent/10 p-2 text-primary outline-none transition-all placeholder:text-slate-500 focus:outline-1 focus:outline-main'
								id='password'
								type='password'
								placeholder='******************'
							/>
						</div>
					</label>
				</div>
				<div className='flex items-center justify-between'>
					<button
						type='submit'
						{...(!isLogin ? {} : { disabled: true })}
						className={`group relative mt-4 flex flex-row items-center justify-center gap-2 overflow-hidden ${!isLogin ? 'cursor-pointer text-primary' : 'cursor-not-allowed bg-blue-900 text-slate-400'} ${isLogin ? '' : 'active:border-accent active:bg-transparent active:text-main sm:hover:border-main sm:hover:text-main'} rounded-xl border border-transparent px-3 py-2 text-lg font-bold transition`}
					>
						<span
							className={`absolute left-0 h-full w-full -skew-x-3 bg-main transition-all duration-300 ease-in-out group-active:w-0 sm:group-hover:w-0 ${isLogin ? 'hidden' : ''}`}
						></span>

						<span className='relative'>
							{!isLogin ? <Login classes='size-5' /> : <Loading classes='size-5' />}
						</span>
						<span className='relative'>{i18n.LOGIN}</span>
					</button>
				</div>
			</form>
		</div>
	)
}
