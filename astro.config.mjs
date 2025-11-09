/* eslint-disable no-undef */
// @ts-check
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import preact from '@astrojs/preact'
import vercel from '@astrojs/vercel'
import * as dotenv from 'dotenv'

dotenv.config()

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), preact()],
	i18n: {
		defaultLocale: 'es',
		locales: ['es', 'en'],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	output: 'server',
	build: {
		inlineStylesheets: 'always',
	},
	compressHTML: true,
	prefetch: true,
	devToolbar: {
		enabled: false,
	},
	adapter: vercel(),
	vite: {
		define: {
			'import.meta.env.EMAILJS_KEY': JSON.stringify(process.env.EMAILJS_KEY),
			'import.meta.env.EMAILJS_SERVICE_ID': JSON.stringify(process.env.EMAILJS_SERVICE_ID),
			'import.meta.env.EMAILJS_TEMPLATE_ID': JSON.stringify(process.env.EMAILJS_TEMPLATE_ID),
			'import.meta.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
			'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
		},
	},
})
