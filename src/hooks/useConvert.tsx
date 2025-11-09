import { getI18N } from '@/locales/index'

export function useConvert(currentLocale: string = 'es') {
	const i18n = getI18N({ currentLocale })

	const convertMode = (mode: string) => {
		switch (mode) {
			case 'time':
				return i18n.SHEDULE_TYPE_TIME
			case 'digital':
				return i18n.SHEDULE_TYPE_DIGITAL
			case 'both':
				return i18n.SHEDULE_TYPE_BOTH
			default:
				return mode
		}
	}

	const convertReason = (reason: string) => {
		switch (reason) {
			case 'month':
				return i18n.MONTH
			case 'birthday':
				return i18n.BIRTHDAYS
			case 'event':
				return i18n.EVENT
			case 'familiar':
				return i18n.FAMILIAR
			default:
				return reason
		}
	}

	return {
		convertMode,
		convertReason,
	}
}
