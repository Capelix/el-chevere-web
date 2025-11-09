import { getI18N } from '@/locales/index'
import { useState } from 'preact/hooks'

export function useLogin() {
	const [isLogin, setIsLogin] = useState(false)
	const [error, setError] = useState(false)

	const sendLogin = (
		{ username, password }: { username: string; password: string },
		currentLocale: string | undefined = 'es'
	) => {
		const i18n = getI18N({ currentLocale })

		const login = async () => {
			setIsLogin(true)
			setError(false)

			const fetchBody = {
				username,
				password,
			}

			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(fetchBody),
			})

			const { error } = await res.json()

			if (error) {
				window.toast({
					dismissible: true,
					title: i18n.EMAIL_PASSWORD_WRONG,
					location: 'bottom-center',
					type: 'error',
					icon: true,
				})

				console.error('Error login:', error)
				setError(true)
				setIsLogin(false)
				return
			}

			// Redirect to dashboard if login is successful
			window.location.href = '/admin/dashboard'

			setIsLogin(false)
		}

		login()
	}

	return {
		isLogin,
		setIsLogin,
		error,
		setError,
		sendLogin,
	}
}
