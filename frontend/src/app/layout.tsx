// This is the root layout component for your Next.js app.
import { cn } from '@/lib/utils';
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { Inter } from 'next/font/google';

import './globals.css';

const fontHeading = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-heading',
});

const fontBody = Inter({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-body',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={cn(
					'antialiased',
					'h-screen',
					fontHeading.variable,
					fontBody.variable,
				)}
			>
				{children}
			</body>
		</html>
	);
}
