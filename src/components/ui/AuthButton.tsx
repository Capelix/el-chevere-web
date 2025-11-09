/* eslint-disable react/react-in-jsx-scope */
import { useAuth } from '@/hooks/useAuth'
import { getI18N } from '@/locales/index'
import { User } from '@/icons/User'
import { useState, useEffect } from 'preact/hooks'

export const AuthButton = ({ currentLocale }: { currentLocale?: string }) => {
	const { user, signOut, loading } = useAuth()
	const i18n = getI18N({ currentLocale })
	const [showMenu, setShowMenu] = useState(false)

	useEffect(() => {
		// Close menu when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement
			if (!target.closest('.auth-button-container')) {
				setShowMenu(false)
			}
		}

		if (showMenu) {
			document.addEventListener('click', handleClickOutside)
			return () => document.removeEventListener('click', handleClickOutside)
		}
	}, [showMenu])

	const handleSignOut = async () => {
		await signOut(currentLocale)
		setShowMenu(false)
	}

	if (loading) {
		return (
			<div className='auth-button-container relative'>
				<button
					disabled
					className='group relative inline-flex cursor-not-allowed select-none items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-2.5 text-base opacity-50 transition-all duration-300'
				>
					<User classes='size-5' />
					<span className='relative z-10'>{i18n.LOADING || 'Loading...'}</span>
				</button>
			</div>
		)
	}

	if (user) {
		return (
			<div className='auth-button-container relative'>
				<button
					onClick={() => setShowMenu(!showMenu)}
					className='group relative inline-flex select-none items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-2.5 text-base transition-all duration-300 hover:border-accent/30 hover:bg-accent/10 hover:text-primary'
				>
					<User classes='size-5 transition-transform duration-300 group-hover:scale-110' />
					<span className='relative z-10'>
						{user.user_metadata.full_name?.split(' ')[0] || i18n.USER || 'User'}
					</span>
				</button>

				{showMenu && (
					<div className='absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-accent/20 bg-back/95 shadow-lg backdrop-blur-xl'>
						<div className='border-b border-accent/10 px-4 py-3'>
							<p className='text-sm font-semibold text-primary'>{user.email}</p>
						</div>
						<button
							onClick={handleSignOut}
							className='w-full px-4 py-2 text-left text-sm text-primary transition-colors hover:bg-accent/10'
						>
							{i18n.LOGOUT}
						</button>
					</div>
				)}
			</div>
		)
	}

	return (
		<a
			href='/auth'
			className='group relative inline-flex select-none items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-2.5 text-base transition-all duration-300 hover:border-accent/30 hover:bg-accent/10 hover:text-primary'
		>
			<User classes='size-5 transition-transform duration-300 group-hover:scale-110' />
			<span className='relative z-10 hidden md:inline'>{i18n.SIGN_IN || 'Sign In'}</span>
		</a>
	)
}
