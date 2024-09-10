'use server';
import { finishProcessing, getNextItemIfNotProcessing, setProcessing } from './db';
import makePdfs from './makePdfs';

export async function checkMoreItems() {
	const nextItem = getNextItemIfNotProcessing();
	if (nextItem) {
		setProcessing(nextItem.id);
		let url = null;
		try {
			url = await makePdfs(nextItem.file, nextItem.area, nextItem.wantedLines, nextItem.excludedLines, nextItem.validFrom);
		}
		catch (e) {
			console.error('Error processing', nextItem.id, e);
		}

		if (!url) {
			console.error('Error processing', nextItem.id);
		}
		else {
			finishProcessing(nextItem.id, url);
			console.log('Finished processing', nextItem.id);
		}
		checkMoreItems();
	}
}
