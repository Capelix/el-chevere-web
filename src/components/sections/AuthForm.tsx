/* eslint-disable react/react-in-jsx-scope */
import { useState, useRef } from 'preact/hooks'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/icons/Loading'
import { User } from '@/icons/User'
import { PasswordUser } from '@/icons/PasswordUser'
import { ImageUpload } from '@/icons/ImageUpload'
import { Phone } from '@/icons/Phone'
import { CheckCircle } from '@/icons/CheckCircle'
import { ErrorCircle } from '@/icons/ErrorCircle'
import { getI18N } from '@/locales/index'
import {
	signInSchema,
	signUpSchema,
	type SignInFormData,
	type SignUpFormData,
} from '@/libs/validation'
import { ZodError } from 'zod'
import { supabase } from '@/db/supabase'
import type { JSX } from 'preact'
import { useEffect } from 'preact/hooks'

export const AuthForm = ({ currentLocale }: { currentLocale?: string }) => {
	const [isSignUp, setIsSignUp] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fullName, setFullName] = useState('')
	const [phone, setPhone] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [touched, setTouched] = useState<Record<string, boolean>>({})
	const [passwordStrength, setPasswordStrength] = useState(0)
	const { signIn, signUp, user } = useAuth()
	const i18n = getI18N({ currentLocale })
	const preserveEmailRef = useRef<string | null>(null)

	// Check if a field is valid (no error and has value)
	const isFieldValid = (field: string, value: string) => {
		if (!touched[field] || !value) return false
		return !errors[field] && value.length > 0
	}

	// Calculate password strength
	const calculatePasswordStrength = (pwd: string) => {
		if (!pwd) return 0
		let strength = 0
		if (pwd.length >= 6) strength++
		if (pwd.length >= 8) strength++
		if (/[a-z]/.test(pwd)) strength++
		if (/[A-Z]/.test(pwd)) strength++
		if (/[0-9]/.test(pwd)) strength++
		if (/[^a-zA-Z0-9]/.test(pwd)) strength++
		return Math.min(strength, 5)
	}

	// Get password strength label
	const getPasswordStrengthLabel = (strength: number) => {
		if (strength === 0) return ''
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (strength <= 2) return (i18n as any).PASSWORD_WEAK || 'Weak'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (strength <= 3) return (i18n as any).PASSWORD_FAIR || 'Fair'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (strength <= 4) return (i18n as any).PASSWORD_GOOD || 'Good'
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (i18n as any).PASSWORD_STRONG || 'Strong'
	}

	// Styles are now injected server-side in auth.astro to prevent FOUC
	// This client-side injection is kept as a fallback for cases where the component
	// is used outside of the auth.astro page
	useEffect(() => {
		if (typeof document !== 'undefined' && !document.getElementById('auth-form-styles')) {
			const style = document.createElement('style')
			style.id = 'auth-form-styles'
			document.head.appendChild(style)
		}
	}, [])

	// Redirect if already logged in
	useEffect(() => {
		if (user) {
			setTimeout(() => {
				window.location.href = '/'
			}, 1500)
		}
	}, [user])

	// Reset form when switching TO sign up mode (preserve email when switching to sign in)
	const [prevIsSignUp, setPrevIsSignUp] = useState(isSignUp)

	useEffect(() => {
		// Scroll to top when switching modes (check before state update)
		if (isSignUp !== prevIsSignUp) {
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}

		// Only reset if switching TO sign up (not from sign up to sign in)
		if (isSignUp && !prevIsSignUp) {
			// Switching to sign up - clear everything
			setEmail('')
			setPassword('')
			setFullName('')
			setPhone('')
			setConfirmPassword('')
			setAvatarFile(null)
			setAvatarPreview(null)
			setErrors({})
			setTouched({})
			setPasswordStrength(0)
			preserveEmailRef.current = null
		} else if (!isSignUp && prevIsSignUp) {
			// Switching to sign in - only clear password and other fields, keep email if preserved
			if (preserveEmailRef.current) {
				setEmail(preserveEmailRef.current)
				preserveEmailRef.current = null
			}
			setPassword('')
			setFullName('')
			setPhone('')
			setConfirmPassword('')
			setAvatarFile(null)
			setAvatarPreview(null)
			setErrors({})
			setTouched({})
			setPasswordStrength(0)
		}
		setPrevIsSignUp(isSignUp)
	}, [isSignUp, prevIsSignUp])

	// Update password strength when password changes
	useEffect(() => {
		if (isSignUp && password) {
			setPasswordStrength(calculatePasswordStrength(password))
		} else {
			setPasswordStrength(0)
		}
	}, [password, isSignUp])

	const validateField = (field: string, value: string | File | undefined) => {
		try {
			if (isSignUp) {
				const formData: {
					fullName: string
					email: string
					phone: string
					password: string
					confirmPassword: string
					avatar?: File
				} = {
					fullName,
					email,
					phone,
					password,
					confirmPassword,
					avatar: avatarFile || undefined,
				}
				// Update the specific field being validated
				if (field === 'fullName') formData.fullName = value as string
				else if (field === 'email') formData.email = value as string
				else if (field === 'phone') formData.phone = value as string
				else if (field === 'password') formData.password = value as string
				else if (field === 'confirmPassword') formData.confirmPassword = value as string
				else if (field === 'avatar') formData.avatar = value as File | undefined

				// Special handling for confirmPassword - also validate password match
				if (field === 'password' || field === 'confirmPassword') {
					// Re-validate both password fields when either changes
					signUpSchema.parse(formData)
				} else {
					signUpSchema.parse(formData)
				}

				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors[field]
					// Also clear the other password field error if validating password match
					if (field === 'password' || field === 'confirmPassword') {
						delete newErrors.password
						delete newErrors.confirmPassword
					}
					return newErrors
				})

				// Field is valid (no errors)
			} else {
				const formData: { email: string; password: string } = { email, password }
				if (field === 'email') formData.email = value as string
				else if (field === 'password') formData.password = value as string

				signInSchema.parse(formData)
				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors[field]
					return newErrors
				})

				// Field is valid (no errors)
			}
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				// For password fields, check both password and confirmPassword errors
				if (field === 'password' || field === 'confirmPassword') {
					const passwordErrors = error.issues.filter((e) =>
						e.path.some((p) => p === 'password' || p === 'confirmPassword')
					)
					setErrors((prev) => {
						const newErrors = { ...prev }
						passwordErrors.forEach((err) => {
							const pathStr = err.path[0]?.toString() || ''
							if (pathStr === 'password' && !err.path.includes('confirmPassword')) {
								newErrors.password = err.message
							} else if (pathStr === 'confirmPassword') {
								newErrors.confirmPassword = err.message
							}
						})
						return newErrors
					})
				} else {
					const fieldError = error.issues.find((e) => e.path.some((p) => p.toString() === field))
					if (fieldError) {
						setErrors((prev) => ({
							...prev,
							[field]: fieldError.message,
						}))
					}
				}

				// Field is invalid (has errors)
			}
		}
	}

	const handleBlur = (field: string, value: string | File | undefined) => {
		setTouched((prev) => ({ ...prev, [field]: true }))
		validateField(field, value)
	}

	const handleAvatarChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
		const file = (e.target as HTMLInputElement).files?.[0]
		if (file) {
			// Validate file
			try {
				signUpSchema.shape.avatar.parse(file)
				setAvatarFile(file)
				// Create preview
				const reader = new FileReader()
				reader.onloadend = () => {
					setAvatarPreview(reader.result as string)
				}
				reader.readAsDataURL(file)
				setErrors((prev) => {
					const newErrors = { ...prev }
					delete newErrors.avatar
					return newErrors
				})
			} catch (error: unknown) {
				if (error instanceof ZodError && error.issues.length > 0) {
					setErrors((prev) => ({
						...prev,
						avatar: error.issues[0].message,
					}))
				}
			}
		}
	}

	const handleSubmit = async (event: JSX.TargetedEvent<HTMLFormElement, Event>) => {
		event.preventDefault()
		if (loading) return

		setLoading(true)
		setErrors({})

		try {
			if (isSignUp) {
				// Validate sign up form
				const formData: SignUpFormData = {
					fullName,
					email,
					phone,
					password,
					confirmPassword,
					avatar: avatarFile || undefined,
				}

				signUpSchema.parse(formData)

				// Sign up user with profile data in metadata (for email confirmation flow)
				const { data: authData, error: authError } = await signUp(email, password, currentLocale, {
					fullName,
					phone,
				})

				if (authError || !authData?.user) {
					window.toast({
						dismissible: true,
						title: authError?.message || i18n.SIGNUP_ERROR || 'Error signing up',
						location: 'bottom-center',
						type: 'error',
						icon: true,
					})
					setLoading(false)
					return
				}

				// Store email before switching modes (to preserve it)
				const savedEmail = email
				preserveEmailRef.current = savedEmail

				// Get session from signUp response (it includes session if email confirmation is disabled)
				// Try multiple times to get the session as it might take a moment to be available
				let session = authData.session
				if (!session) {
					// Try up to 3 times with increasing delays
					for (let i = 0; i < 3; i++) {
						await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
						const {
							data: { session: currentSession },
						} = await supabase.auth.getSession()
						if (currentSession) {
							session = currentSession
							break
						}
					}
				}

				let avatarUrl: string | null = null
				let profileSaved = false

				// Upload avatar and save profile only if session exists (email confirmation not required)
				if (session && session.access_token) {
					if (avatarFile) {
						try {
							// Generate a unique file name
							const fileExt = avatarFile.name.split('.').pop()
							const fileName = `${authData.user?.id}-${Date.now()}.${fileExt}`

							// Try direct Supabase Storage upload first
							const { error: uploadError } = await supabase.storage
								.from('avatars')
								.upload(fileName, avatarFile, {
									contentType: avatarFile.type,
									upsert: false,
								})

							if (uploadError) {
								console.error('Direct Storage upload failed:', uploadError)
								// Fallback to API endpoint
								const formData = new FormData()
								formData.append('avatar', avatarFile)

								const uploadResponse = await fetch('/api/db/upload-avatar', {
									method: 'POST',
									headers: {
										Authorization: `Bearer ${session.access_token}`,
									},
									body: formData,
								})

								if (uploadResponse.ok) {
									const uploadApiData = await uploadResponse.json()
									avatarUrl = uploadApiData.url
								} else {
									const uploadApiError = await uploadResponse.json()
									console.error('Avatar upload via API also failed:', uploadApiError)
								}
							} else {
								const {
									data: { publicUrl },
								} = supabase.storage.from('avatars').getPublicUrl(fileName)
								avatarUrl = publicUrl
							}
						} catch (uploadError) {
							console.error('Error uploading avatar:', uploadError)
						}
					}

					try {
						const { error: profileError } = await supabase
							.from('profiles')
							.upsert(
								{
									auth_id: authData.user?.id,
									full_name: fullName,
									email: savedEmail,
									phone: phone || null,
									avatar_url: avatarUrl || null,
								},
								{
									onConflict: 'auth_id',
								}
							)
							.select()

						if (profileError) {
							console.error('Direct Supabase insert failed:', profileError)
							// Fallback to API endpoint
							const profileResponse = await fetch('/api/db/save-user-profile', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${session.access_token}`,
								},
								body: JSON.stringify({
									fullName,
									email: savedEmail,
									phone,
									avatarUrl,
								}),
							})

							if (!profileResponse.ok) {
								const errorData = await profileResponse.json()
								console.error('API endpoint also failed:', errorData)
								window.toast({
									dismissible: true,
									title: errorData.error || 'Error saving profile',
									location: 'bottom-center',
									type: 'error',
									icon: true,
								})
								setLoading(false)
								return
							} else {
								profileSaved = true
							}
						} else {
							const { data: verifyData, error: verifyError } = await supabase
								.from('profiles')
								.select('auth_id, full_name, email')
								.eq('auth_id', authData.user?.id)
								.single()

							if (verifyError || !verifyData) {
								console.error('Profile verification failed:', verifyError)
								window.toast({
									dismissible: true,
									title: 'Warning: Profile may not have been saved correctly.',
									location: 'bottom-center',
									type: 'error',
									icon: true,
								})
							} else {
								profileSaved = true
							}
						}
					} catch (profileError) {
						console.error('Error saving user profile:', profileError)
						window.toast({
							dismissible: true,
							title: 'Error saving profile. Please try again.',
							location: 'bottom-center',
							type: 'error',
							icon: true,
						})
						setLoading(false)
						return
					}

					await supabase.auth.signOut()
				}

				setIsSignUp(false)

				if (session && profileSaved) {
					window.toast({
						dismissible: true,
						title: i18n.SIGNUP_SUCCESS || 'Account created successfully!',
						location: 'bottom-center',
						type: 'success',
						icon: true,
					})
				} else if (!session) {
					window.toast({
						dismissible: true,
						title:
							i18n.SIGNUP_SUCCESS_CHECK_EMAIL || 'Please check your email to confirm your account',
						location: 'bottom-center',
						type: 'success',
						icon: true,
					})
				} else if (session && !profileSaved) {
					window.toast({
						dismissible: true,
						title: 'Account created but profile could not be saved. Please contact support.',
						location: 'bottom-center',
						type: 'error',
						icon: true,
					})
				}
			} else {
				const formData: SignInFormData = { email, password }
				signInSchema.parse(formData)
				const { data: signInData, error: signInError } = await signIn(
					email,
					password,
					currentLocale
				)

				// After successful sign in, check if profile exists and create it if it doesn't
				if (signInData?.session && !signInError) {
					try {
						const session = signInData.session
						const userId = session.user.id
						const userMetadata = session.user.user_metadata || {}

						// Check if profile exists
						const { data: profileData, error: profileCheckError } = await supabase
							.from('profiles')
							.select('auth_id, full_name, email, phone')
							.eq('auth_id', userId)
							.single()

						// If profile doesn't exist, create it using metadata from sign-up or defaults
						if (profileCheckError || !profileData) {
							// Get profile data from user metadata (stored during sign-up) or use defaults
							const profileFullName =
								userMetadata.full_name || session.user.email?.split('@')[0] || 'User'
							const profileEmail = session.user.email || email
							const profilePhone = userMetadata.phone || null

							// Try direct insert first
							const { error: insertError } = await supabase
								.from('profiles')
								.insert({
									auth_id: userId,
									full_name: profileFullName,
									email: profileEmail,
									phone: profilePhone,
									avatar_url: null,
								})
								.select()
								.single()

							if (insertError) {
								console.error('Direct insert failed, trying API:', insertError)
								// Fallback to API endpoint
								const profileResponse = await fetch('/api/db/save-user-profile', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${session.access_token}`,
									},
									body: JSON.stringify({
										fullName: profileFullName,
										email: profileEmail,
										phone: profilePhone,
										avatarUrl: null,
									}),
								})

								if (!profileResponse.ok) {
									const errorData = await profileResponse.json()
									console.error('Error creating profile on sign in:', errorData)
								}
							}
						} else {
							// Profile exists, but check if we need to update it with metadata from sign-up
							// Update if metadata exists and profile fields are empty or different
							const updateData: { full_name?: string; phone?: string | null } = {}

							if (
								userMetadata.full_name &&
								(!profileData.full_name || profileData.full_name !== userMetadata.full_name)
							) {
								updateData.full_name = userMetadata.full_name
							}

							if (userMetadata.phone && profileData.phone !== userMetadata.phone) {
								updateData.phone = userMetadata.phone
							}

							if (Object.keys(updateData).length > 0) {
								const { error: updateError } = await supabase
									.from('profiles')
									.update(updateData)
									.eq('auth_id', userId)

								if (updateError) {
									console.error('Error updating profile:', updateError)
								}
							}
						}
					} catch (profileError) {
						console.error('Error checking/creating profile on sign in:', profileError)
					}
				}
			}
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				// Zod validation errors
				const newErrors: Record<string, string> = {}
				error.issues.forEach((err) => {
					if (err.path && err.path.length > 0) {
						newErrors[err.path[0] as string] = err.message
					}
				})
				setErrors(newErrors)
			} else {
				// Other errors
				console.error('Error:', error)
			}
		} finally {
			setLoading(false)
		}
	}

	if (user) {
		return (
			<div className='auth-card'>
				<div className='auth-card-content'>
					<div className='mb-6 text-center'>
						<div className='auth-success-icon'>✓</div>
						<h2 className='auth-title mt-4'>
							{i18n.ALREADY_SIGNED_IN || 'You are already signed in!'}
						</h2>
						<p className='auth-subtitle mt-2'>{i18n.REDIRECTING || 'Redirecting...'}</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='auth-card'>
			<div className='auth-card-content'>
				{/* Logo */}
				<div className='auth-logo-container'>
					<img
						src='https://www.fotoestudioelchevere.com/logo-no-name.png'
						srcSet='https://www.fotoestudioelchevere.com/logo-no-name.png'
						alt='Logo Foto Estudio El Chévere'
						loading='lazy'
						decoding='async'
						className='auth-logo'
					/>
				</div>

				{/* Title */}
				<div className='auth-header'>
					<h1 className='auth-title'>
						{isSignUp ? i18n.SIGN_UP || 'Create Account' : i18n.SIGN_IN || 'Welcome Back'}
					</h1>
					<p className='auth-subtitle'>
						{isSignUp
							? i18n.SIGNUP_SUBTITLE || 'Sign up to get started'
							: i18n.SIGNIN_SUBTITLE || 'Sign in to your account'}
					</p>
				</div>

				{/* Toggle between Sign In and Sign Up */}
				<div className='auth-toggle'>
					<button
						type='button'
						onClick={() => setIsSignUp(false)}
						className={`auth-toggle-button ${!isSignUp ? 'auth-toggle-active' : ''}`}
					>
						{i18n.SIGN_IN || 'Sign In'}
					</button>
					<button
						type='button'
						onClick={() => setIsSignUp(true)}
						className={`auth-toggle-button ${isSignUp ? 'auth-toggle-active' : ''}`}
					>
						{i18n.SIGN_UP || 'Sign Up'}
					</button>
				</div>

				<form onSubmit={handleSubmit} className='auth-form'>
					{isSignUp && (
						<div className='auth-field-group'>
							<label className='auth-label'>
								{i18n.FULL_NAME || 'Full Name'}
								<span className='text-red-400'>*</span>
							</label>
							<div
								className={`auth-input-wrapper ${
									touched.fullName && errors.fullName
										? 'auth-input-error-state'
										: isFieldValid('fullName', fullName)
											? 'auth-input-success-state'
											: ''
								}`}
							>
								<span className='auth-input-icon'>
									<User classes='size-5' />
								</span>
								<input
									className='auth-input'
									name='fullName'
									type='text'
									required
									autoComplete='name'
									placeholder={i18n.FULL_NAME || 'Full Name'}
									value={fullName}
									onInput={(e) => {
										const value = (e.target as HTMLInputElement).value
										setFullName(value)
										if (touched.fullName) validateField('fullName', value)
									}}
									onBlur={(e) => handleBlur('fullName', (e.target as HTMLInputElement).value)}
								/>
								{touched.fullName && errors.fullName && (
									<span className='auth-status-icon auth-error-icon'>
										<ErrorCircle classes='size-5' />
									</span>
								)}
								{isFieldValid('fullName', fullName) && (
									<span className='auth-status-icon auth-success-icon'>
										<CheckCircle classes='size-5' />
									</span>
								)}
							</div>
							{touched.fullName && errors.fullName && (
								<div className='auth-error-message'>
									<ErrorCircle classes='size-4' />
									<span>{errors.fullName}</span>
								</div>
							)}
							{isFieldValid('fullName', fullName) && (
								<div className='auth-success-message'>
									<CheckCircle classes='size-4' />
									{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
									<span>{(i18n as any).FIELD_VALID || 'Looks good!'}</span>
								</div>
							)}
						</div>
					)}

					<div className='auth-field-group'>
						<label className='auth-label'>
							{i18n.EMAIL}
							<span className='text-red-400'>*</span>
						</label>
						<div
							className={`auth-input-wrapper ${
								touched.email && errors.email
									? 'auth-input-error-state'
									: isFieldValid('email', email)
										? 'auth-input-success-state'
										: ''
							}`}
						>
							<span className='auth-input-icon'>
								<User classes='size-5' />
							</span>
							<input
								className='auth-input'
								name='email'
								type='email'
								required
								placeholder={i18n.EMAIL}
								value={email}
								onInput={(e) => {
									const value = (e.target as HTMLInputElement).value
									setEmail(value)
									if (touched.email) validateField('email', value)
								}}
								onBlur={(e) => handleBlur('email', (e.target as HTMLInputElement).value)}
							/>
							{touched.email && errors.email && (
								<span className='auth-status-icon auth-error-icon'>
									<ErrorCircle classes='size-5' />
								</span>
							)}
							{isFieldValid('email', email) && (
								<span className='auth-status-icon auth-success-icon'>
									<CheckCircle classes='size-5' />
								</span>
							)}
						</div>
						{touched.email && errors.email && (
							<div className='auth-error-message'>
								<ErrorCircle classes='size-4' />
								<span>{errors.email}</span>
							</div>
						)}
						{isFieldValid('email', email) && (
							<div className='auth-success-message'>
								<CheckCircle classes='size-4' />
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								<span>{(i18n as any).FIELD_VALID || 'Valid email address'}</span>
							</div>
						)}
					</div>

					{isSignUp && (
						<div className='auth-field-group'>
							<label className='auth-label'>
								{i18n.PHONE}
								<span className='text-red-400'>*</span>
							</label>
							<div
								className={`auth-input-wrapper ${
									touched.phone && errors.phone
										? 'auth-input-error-state'
										: isFieldValid('phone', phone)
											? 'auth-input-success-state'
											: ''
								}`}
							>
								<span className='auth-input-icon'>
									<Phone classes='size-5' />
								</span>
								<input
									className='auth-input'
									name='phone'
									type='tel'
									required
									placeholder={i18n.PHONE_PLACEHOLDER || '(809) 573-4173'}
									value={phone}
									onInput={(e) => {
										const value = (e.target as HTMLInputElement).value
										setPhone(value)
										if (touched.phone) validateField('phone', value)
									}}
									onBlur={(e) => handleBlur('phone', (e.target as HTMLInputElement).value)}
								/>
								{touched.phone && errors.phone && (
									<span className='auth-status-icon auth-error-icon'>
										<ErrorCircle classes='size-5' />
									</span>
								)}
								{isFieldValid('phone', phone) && (
									<span className='auth-status-icon auth-success-icon'>
										<CheckCircle classes='size-5' />
									</span>
								)}
							</div>
							{touched.phone && errors.phone && (
								<div className='auth-error-message'>
									<ErrorCircle classes='size-4' />
									<span>{errors.phone}</span>
								</div>
							)}
							{isFieldValid('phone', phone) && (
								<div className='auth-success-message'>
									<CheckCircle classes='size-4' />
									{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
									<span>{(i18n as any).FIELD_VALID || 'Valid phone number'}</span>
								</div>
							)}
							{!touched.phone && !errors.phone && (
								<p className='auth-hint'>{i18n.PHONE_HINT || 'Format: (809) 573-4173'}</p>
							)}
						</div>
					)}

					<div className='auth-field-group'>
						<label className='auth-label'>
							{i18n.PASSWORD}
							<span className='text-red-400'>*</span>
						</label>
						<div
							className={`auth-input-wrapper ${
								touched.password && errors.password
									? 'auth-input-error-state'
									: isFieldValid('password', password)
										? 'auth-input-success-state'
										: ''
							}`}
						>
							<span className='auth-input-icon'>
								<PasswordUser classes='size-5' />
							</span>
							<input
								className='auth-input'
								name='password'
								type='password'
								required
								minLength={6}
								placeholder={i18n.PASSWORD}
								value={password}
								onInput={(e) => {
									const value = (e.target as HTMLInputElement).value
									setPassword(value)
									if (touched.password) {
										validateField('password', value)
									}
									// Also validate confirmPassword if it's been touched
									if (touched.confirmPassword && isSignUp) {
										validateField('confirmPassword', confirmPassword)
									}
								}}
								onBlur={(e) => handleBlur('password', (e.target as HTMLInputElement).value)}
							/>
							{touched.password && errors.password && (
								<span className='auth-status-icon auth-error-icon'>
									<ErrorCircle classes='size-5' />
								</span>
							)}
							{isFieldValid('password', password) && (
								<span className='auth-status-icon auth-success-icon'>
									<CheckCircle classes='size-5' />
								</span>
							)}
						</div>
						{touched.password && errors.password && (
							<div className='auth-error-message'>
								<ErrorCircle classes='size-4' />
								<span>{errors.password}</span>
							</div>
						)}
						{isSignUp && password && (
							<div className='auth-password-strength'>
								<div className='auth-password-strength-bars'>
									{[1, 2, 3, 4, 5].map((level) => (
										<div
											key={level}
											className={`auth-strength-bar ${
												passwordStrength >= level
													? passwordStrength <= 2
														? 'auth-strength-weak'
														: passwordStrength <= 3
															? 'auth-strength-fair'
															: passwordStrength <= 4
																? 'auth-strength-good'
																: 'auth-strength-strong'
													: ''
											}`}
										/>
									))}
								</div>
								{passwordStrength > 0 && (
									<span
										className={`auth-password-strength-label ${
											passwordStrength <= 2
												? 'auth-strength-weak'
												: passwordStrength <= 3
													? 'auth-strength-fair'
													: passwordStrength <= 4
														? 'auth-strength-good'
														: 'auth-strength-strong'
										}`}
									>
										{getPasswordStrengthLabel(passwordStrength)}
									</span>
								)}
							</div>
						)}
						{isFieldValid('password', password) && (
							<div className='auth-success-message'>
								<CheckCircle classes='size-4' />
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								<span>{(i18n as any).PASSWORD_VALID || 'Password is valid'}</span>
							</div>
						)}
					</div>

					{isSignUp && (
						<>
							<div className='auth-field-group'>
								<label className='auth-label'>
									{i18n.CONFIRM_PASSWORD || 'Confirm Password'}
									<span className='text-red-400'>*</span>
								</label>
								<div
									className={`auth-input-wrapper ${
										touched.confirmPassword && errors.confirmPassword
											? 'auth-input-error-state'
											: isFieldValid('confirmPassword', confirmPassword)
												? 'auth-input-success-state'
												: ''
									}`}
								>
									<span className='auth-input-icon'>
										<PasswordUser classes='size-5' />
									</span>
									<input
										className='auth-input'
										name='confirmPassword'
										type='password'
										required
										minLength={6}
										placeholder={i18n.CONFIRM_PASSWORD || 'Confirm Password'}
										value={confirmPassword}
										onInput={(e) => {
											const value = (e.target as HTMLInputElement).value
											setConfirmPassword(value)
											if (touched.confirmPassword) {
												validateField('confirmPassword', value)
											}
											// Also validate password if it's been touched
											if (touched.password) {
												validateField('password', password)
											}
										}}
										onBlur={(e) =>
											handleBlur('confirmPassword', (e.target as HTMLInputElement).value)
										}
									/>
									{touched.confirmPassword && errors.confirmPassword && (
										<span className='auth-status-icon auth-error-icon'>
											<ErrorCircle classes='size-5' />
										</span>
									)}
									{isFieldValid('confirmPassword', confirmPassword) && (
										<span className='auth-status-icon auth-success-icon'>
											<CheckCircle classes='size-5' />
										</span>
									)}
								</div>
								{touched.confirmPassword && errors.confirmPassword && (
									<div className='auth-error-message'>
										<ErrorCircle classes='size-4' />
										<span>{errors.confirmPassword}</span>
									</div>
								)}
								{isFieldValid('confirmPassword', confirmPassword) && (
									<div className='auth-success-message'>
										<CheckCircle classes='size-4' />
										{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
										<span>{(i18n as any).PASSWORDS_MATCH || 'Passwords match'}</span>
									</div>
								)}
							</div>

							<div className='auth-field-group'>
								<label className='auth-label'>
									{i18n.PROFILE_IMAGE || 'Profile Image (Optional)'}
								</label>
								<div className='auth-avatar-upload'>
									<div className='auth-input-wrapper'>
										<span className='auth-input-icon'>
											<ImageUpload classes='size-5' />
										</span>
										<input
											className={`auth-input-file ${touched.avatar && errors.avatar ? 'auth-input-error' : ''}`}
											name='avatar'
											type='file'
											accept='image/jpeg,image/jpg,image/png,image/webp'
											onChange={handleAvatarChange}
											onBlur={() => setTouched((prev) => ({ ...prev, avatar: true }))}
										/>
									</div>
									{avatarPreview && (
										<div className='auth-avatar-preview'>
											<img src={avatarPreview} alt='Avatar preview' className='auth-avatar-image' />
										</div>
									)}
									{touched.avatar && errors.avatar && (
										<div className='auth-error-message'>
											<ErrorCircle classes='size-4' />
											<span>{errors.avatar}</span>
										</div>
									)}
									{avatarFile && !errors.avatar && (
										<div className='auth-success-message'>
											<CheckCircle classes='size-4' />
											{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
											<span>{(i18n as any).IMAGE_VALID || 'Image selected successfully'}</span>
										</div>
									)}
									{!touched.avatar && !errors.avatar && (
										<p className='auth-hint'>
											{i18n.IMAGE_UPLOAD_HINT || 'Max 5MB. Supported formats: JPEG, PNG, WebP'}
										</p>
									)}
								</div>
							</div>
						</>
					)}

					<button type='submit' disabled={loading} className='auth-submit-button'>
						{loading ? (
							<>
								<Loading classes='size-5' />
								<span>{i18n.LOADING || 'Loading...'}</span>
							</>
						) : (
							<span>{isSignUp ? i18n.SIGN_UP || 'Sign Up' : i18n.SIGN_IN || 'Sign In'}</span>
						)}
					</button>
				</form>

				{isSignUp && (
					<p className='auth-footer-text'>
						{i18n.SIGNUP_MESSAGE || 'By signing up, you agree to our Terms and Privacy Policy'}
					</p>
				)}
			</div>
		</div>
	)
}
