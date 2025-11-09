import type { Reason } from '@/interfaces/reason'
import { getI18N } from '@/locales/index'

export const getReasons = (currentLocale: string = 'es'): Reason[] => {
	const i18n = getI18N({ currentLocale })

	return [
		{
			id: 'birthday',
			option: i18n.BIRTHDAYS,
		},
		{
			id: 'month',
			option: i18n.MONTH,
		},
		{
			id: 'event',
			option: i18n.EVENT,
		},
		{
			id: 'familiar',
			option: i18n.FAMILIAR,
		},
	]
}
