import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone';
import 'dayjs/locale/pt';
dayjs.extend(utc);
dayjs.extend(tz);

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
	if (!date) {
		return '';
	}
	// DD.MM.YYYY
	const yyyy = date.getFullYear();
	const mm = (date.getMonth() + 1).toString().padStart(2, '0');
	const dd = date.getDate().toString().padStart(2, '0');
	return `${dd}.${mm}.${yyyy}`;
}

export function formatTime(date: Date) {
	// YYYY-MM-DD HH:MM
	return dayjs(date).tz('Europe/Lisbon').format("YYYY-MM-DD HH:mm");
}
