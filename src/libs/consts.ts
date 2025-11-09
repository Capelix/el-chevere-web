import type { NavItem } from '@/interfaces/navItems'
import { getI18N } from '@/locales/index.ts'
import type { Philosophy } from '../interfaces/philosophy'
import Home from '@/icons/Home.astro'
import DateIcon from '@/icons/Date.astro'
import PhotoLibrary from '@/icons/PhotoLibrary.astro'
import Chat from '@/icons/Chat.astro'
import type { FooterLink } from '../interfaces/footerLink'
import GitHub from '@/icons/GitHub.astro'
import Instagram from '@/icons/Instagram.astro'
import WhatsApp from '@/icons/WhatsApp.astro'

export const businessEmail = 'fotoestudioelchevere@hotmail.com'
export const businessInstagram = 'https://instagram.com/fotoestudioelchevere/'
export const businessWhatsApp = 'https://wa.me/18095734173'
export const gMapLocation = 'https://maps.app.goo.gl/5jkKp6yxqypxvy1B8'

const date = new Date()
export const currentYear = date.getFullYear()
export const yearsSince = 1978
export const satisfiedCustomers = 3500
export const photoStyles = 10
export const currentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const tomorrowDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate() + 1).padStart(2, '0')}`

export const navItemsProvider = (currentLocale: string | undefined): NavItem[] => {
	const i18n = getI18N({ currentLocale })
	return [
		{
			title: i18n.HOME,
			label: 'home',
			url: '/',
			icon: Home,
		},
		{
			title: i18n.DATES,
			label: 'dates',
			url: '/schedule',
			icon: DateIcon,
		},
		{
			title: i18n.PORTFOLIO,
			label: 'portfolio',
			url: '/#portfolio',
			icon: PhotoLibrary,
		},
		{
			title: i18n.CONTACT,
			label: 'contact',
			url: '#contact',
			icon: Chat,
		},
	]
}

export const philosophy = (currentLocale: string | undefined): Philosophy[] => {
	const i18n = getI18N({ currentLocale })

	return [
		{
			title: i18n.OUR_MISSION,
			description:
				'Capturar la esencia y la conexión única de cada familia a través de imágenes auténticas y llenas de emoción.',
			icon: '🚀',
		},
		{
			title: i18n.OUR_VISION,
			description:
				'Ser el estudio fotográfico de referencia donde las familias crean y preservan sus recuerdos más valiosos.',
			icon: '🌍',
		},
		{
			title: i18n.OUR_VALUES,
			description:
				'Integridad, Innovación, Respeto, Transparencia, Amabilidad, Compañerismo, Calidad, Responsabilidad',
			icon: '💡',
		},
	]
}

export const footerLinks = (): FooterLink[] => {
	return [
		{
			description:
				"Foto Estudio El Chévere's WhatsApp channel brand logo will open in a new window",
			href: businessWhatsApp,
			icon: WhatsApp,
		},
		{
			description: "Foto Estudio El Chévere's Instagram brand logo will open in a new window",
			href: businessInstagram,
			icon: Instagram,
		},
		{
			description: "Foto Estudio El Chévere's GitHub brand logo will open in a new window",
			href: 'https://github.com/RikiRilis/el-chevere-web',
			icon: GitHub,
		},
	]
}
