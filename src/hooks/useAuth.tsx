import { useEffect, useState } from 'preact/hooks'
import { supabase } from '@/db/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { getI18N } from '@/locales/index'

export function useAuth() {
	const [user, setUser] = useState<User | null>(null)
	const [session, setSession] = useState<Session | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [])

	const signUp = async (
		email: string,
		password: string,
		currentLocale?: string,
		metadata?: { fullName?: string; phone?: string }
	) => {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: metadata?.fullName || '',
						phone: metadata?.phone || '',
					},
				},
			})

			if (error) throw error

			return { data, error: null }
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Error signing up'
			return { data: null, error: new Error(errorMessage) }
		}
	}

	const signIn = async (email: string, password: string, currentLocale?: string) => {
		const i18n = getI18N({ currentLocale })
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) throw error

			window.toast({
				dismissible: true,
				title: i18n.SIGNIN_SUCCESS || 'Signed in successfully!',
				location: 'bottom-center',
				type: 'success',
				icon: true,
			})

			return { data, error: null }
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : i18n.SIGNIN_ERROR || 'Error signing in'
			window.toast({
				dismissible: true,
				title: errorMessage,
				location: 'bottom-center',
				type: 'error',
				icon: true,
			})
			return { data: null, error: error instanceof Error ? error : new Error(errorMessage) }
		}
	}

	const signOut = async (currentLocale?: string) => {
		const i18n = getI18N({ currentLocale })
		try {
			const { error } = await supabase.auth.signOut()

			if (error) throw error

			window.toast({
				dismissible: true,
				title: i18n.SIGNOUT_SUCCESS || 'Signed out successfully!',
				location: 'bottom-center',
				type: 'success',
				icon: true,
			})

			return { error: null }
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : i18n.SIGNOUT_ERROR || 'Error signing out'
			window.toast({
				dismissible: true,
				title: errorMessage,
				location: 'bottom-center',
				type: 'error',
				icon: true,
			})
			return { error: error instanceof Error ? error : new Error(errorMessage) }
		}
	}

	return {
		user,
		session,
		loading,
		signUp,
		signIn,
		signOut,
	}
}
