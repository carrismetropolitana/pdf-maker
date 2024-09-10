'use server';

import { addUpload, cancelQueued, getUploads } from '@/lib/db';
import { checkMoreItems } from '@/lib/utils.server';

export interface SubmitFileInput {
	area: string
	excludedLines: string[]
	file: File
	validFrom: Date
	wantedLines: string[]
};

export async function submitFile(form: FormData) {
	const file = form.get('file') as File;
	const area = form.get('area') as string;
	const wantedLines = (form.getAll('wantedLines') || []) as string[];
	const excludedLines = (form.getAll('excludedLines') || []) as string[];
	const validFrom = form.get('validFrom') as string;
	console.log('submitFile', file, area, wantedLines, excludedLines, validFrom);
	await addUpload(file, area, wantedLines, excludedLines, validFrom);

	checkMoreItems();
	return getUploads();
}

export async function getUploadsAction() {
	return getUploads();
}

export async function cancelProcessingAction(id: number) {
	cancelQueued(id);
	return getUploads();
}
