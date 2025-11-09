import type { Category } from '@/interfaces/category'
import { getI18N } from '@/locales/index'
import { getImagesWithSize } from '@/libs/getImageSizes'

export const getCategories = (currentLocale?: string): Category[] => {
	const i18n = getI18N({ currentLocale })

	return [
		{
			id: 'babies',
			name: i18n.BABIES,
			description: i18n.CAT_BABIES_DESCRIPTION,
			image: '/statics/categories/cat-babies',
			images: getImagesWithSize('statics/categories/babies'),
		},
		{
			id: 'weddings',
			name: i18n.WEDDINGS,
			description: i18n.CAT_WEDDINGS_DESCRIPTION,
			image: '/statics/categories/cat-weddings',
			images: getImagesWithSize('statics/categories/weddings'),
		},
		{
			id: 'portraits',
			name: i18n.PORTRAITS,
			description: i18n.CAT_PORTRAITS_DESCRIPTION,
			image: '/statics/categories/cat-portraits',
			images: getImagesWithSize('statics/categories/portraits'),
		},
		{
			id: 'events',
			name: i18n.EVENTS,
			description: i18n.CAT_EVENTS_DESCRIPTION,
			image: '/statics/categories/cat-events',
			images: getImagesWithSize('statics/categories/events'),
		},
		{
			id: 'birthdays',
			name: i18n.BIRTHDAYS,
			description: i18n.CAT_BIRTHDAYS_DESCRIPTION,
			image: '/statics/categories/cat-birthdays',
			images: getImagesWithSize('statics/categories/birthdays'),
		},
		{
			id: 'couples',
			name: i18n.COUPLES,
			description: i18n.CAT_COUPLES_DESCRIPTION,
			image: '/statics/categories/cat-couples',
			images: getImagesWithSize('statics/categories/couples'),
		},
		{
			id: 'fifteens',
			name: i18n.FIFTEENS,
			description: i18n.CAT_FIFTEENS_DESCRIPTION,
			image: '/statics/categories/cat-fifteens',
			images: getImagesWithSize('statics/categories/fifteens'),
		},
		{
			id: 'graduations',
			name: i18n.GRADUATIONS,
			description: i18n.CAT_GRADUATIONS_DESCRIPTION,
			image: '/statics/categories/cat-graduations',
			images: getImagesWithSize('statics/categories/graduations'),
		},
		{
			id: 'outdoors',
			name: i18n.OUTDOORS,
			description: i18n.CAT_OUTDOORS_DESCRIPTION,
			image: '/statics/categories/cat-outdoors',
			images: getImagesWithSize('statics/categories/outdoors'),
		},
	]
}
