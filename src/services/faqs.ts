import type { Faq } from '@/interfaces/faqs'
import { getI18N } from '@/locales/index'

export const getFaqs = (currentLocale: string | undefined): Faq[] => {
	const i18n = getI18N({ currentLocale })

	return [
		{
			answers: [i18n.FAQ_QA_1, i18n.FAQ_QA_2, i18n.FAQ_QA_3],
			question: i18n.FAQ_Q_1,
		},
		{
			answers: [i18n.FAQ_QA_4],
			question: i18n.FAQ_Q_2,
		},
		{
			answers: [i18n.FAQ_QA_5],
			question: i18n.FAQ_Q_3,
		},
		{
			answers: [i18n.FAQ_QA_6],
			question: i18n.FAQ_Q_4,
		},
		{
			answers: [i18n.FAQ_QA_7],
			question: i18n.FAQ_Q_5,
		},
		{
			answers: [i18n.FAQ_QA_8],
			question: i18n.FAQ_Q_6,
		},
		{
			answers: [i18n.FAQ_QA_9],
			question: i18n.FAQ_Q_7,
		},
	]
}
