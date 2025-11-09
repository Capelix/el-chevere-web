import { defineMiddleware } from 'astro:middleware'
import { supabase } from '@/db/supabase'

const ONE_DAY_MS = 1000 * 60 * 60 * 24 // 1 day in milliseconds

export const onRequest = defineMiddleware(async ({ cookies, redirect, url }, next) => {
	const raw = cookies.get('admin_session')?.value
	const pathname = url.pathname

	let isValidAdmin = false

	if (raw) {
		try {
			// Decode the base64 session
			// Parse the JSON data
			const json = JSON.parse(Buffer.from(raw, 'base64').toString())
			const { username, issuedAt } = json

			// Verify if the session is still valid
			if (Date.now() - issuedAt < ONE_DAY_MS) {
				// Verify if the username exists in the database
				const { data, error } = await supabase
					.from('admins')
					.select('username')
					.eq('username', username)
					.single()

				if (!error && data) {
					isValidAdmin = true
				}
			} else {
				// Expired session
				cookies.delete('admin_session', { path: '/' })
			}
		} catch (err) {
			// Si la cookie no es válida o está mal formada
			cookies.delete('admin_session', { path: '/' })
			console.error('Invalid session cookie:', err)
		}
	}

	// Redirect if already logged in
	if (pathname === '/admin/login' && isValidAdmin) {
		return redirect('/admin/dashboard')
	}

	// Protected routes
	// Check if the user is trying to access a protected route
	const protectedRoutes = ['/admin/dashboard']
	if (protectedRoutes.some((route) => pathname.startsWith(route))) {
		if (!isValidAdmin) {
			return redirect('/admin/login')
		}
	}

	return next()
})
