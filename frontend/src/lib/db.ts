import { Database } from 'bun:sqlite';

const db = new Database('db.sqlite', { create: true });

// make table if not exists holding the file uploads
db.exec(`
CREATE TABLE IF NOT EXISTS uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT,
  file BLOB,
  area TEXT,
  wantedLines TEXT,
  excludedLines TEXT,
  validFrom TEXT,
  status TEXT,
	downloadLink TEXT,
  submissionTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// Object & string hack for autocomplete union type
type UploadStatus = 'processing' | 'queued' | (object & string);
export interface Upload {
	area: string
	excludedLines: string[]
	file: Uint8Array
	filename: string
	id: number
	status: UploadStatus
	submissionTime: Date
	validFrom: string
	wantedLines: string[]
}

interface UploadRow {
	area: string
	excludedLines: string
	file: Uint8Array
	filename: string
	id: number
	status: UploadStatus
	submissionTime: string
	validFrom: string
	wantedLines: string
}

function uploadRowtoUpload(row: UploadRow): Upload {
	return {
		...row,
		excludedLines: JSON.parse(row.excludedLines),
		submissionTime: new Date(row.submissionTime),
		wantedLines: JSON.parse(row.wantedLines),
	};
}

export async function addUpload(file: File, area: string, wantedLines: string[], excludedLines: string[], validFrom: string) {
	const statement = db.prepare<undefined, [string, Uint8Array, string, string, string, string, 'queued']>(`
    INSERT INTO uploads (filename, file, area, wantedLines, excludedLines, validFrom, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
	statement.run(file.name, await file.bytes(), area, JSON.stringify(wantedLines), JSON.stringify(excludedLines), validFrom, 'queued');
}

export function cancelQueued(id: number) {
	// remove row
	const result = db.prepare<undefined, [number]>(`
    DELETE FROM uploads
    WHERE id = ? AND status = 'queued' OR status = 'processing'
  `).run(id);
	console.log(result);
}

export function getUploads(): Omit<Upload, 'file'>[] {
	return db.prepare<Omit<UploadRow, 'file'>, []>(`
    SELECT id, filename, area, wantedLines, excludedLines, validFrom, status, submissionTime
    FROM uploads
    ORDER BY submissionTime DESC
  `).all().map(row => ({
		...row,
		excludedLines: JSON.parse(row.excludedLines),
		submissionTime: new Date(row.submissionTime),
		wantedLines: JSON.parse(row.wantedLines),
	}));
}

export function finishProcessing(id: number, downloadLink: string) {
	db.prepare<undefined, [string, number]>(`
		UPDATE uploads
		SET status = ?
		WHERE id = ?
	`).run(downloadLink, id);
}

export function getNextItemIfNotProcessing(): Upload | null {
	const transaction = db.transaction(() => {
		const processing = db.prepare<UploadRow, []>(`
		SELECT id, status, submissionTime
		FROM uploads
		WHERE status = 'processing'
	`).get();
		if (processing) return null;

		return db.prepare<UploadRow, []>(`
		SELECT *
		FROM uploads
		WHERE status = 'queued'
		ORDER BY submissionTime ASC
		LIMIT 1
		`).get();
	});
	const res = transaction();
	if (res) {
		return uploadRowtoUpload(res);
	}
	return null;
}

export function setProcessing(id: number) {
	db.prepare<undefined, [number]>(`
		UPDATE uploads
		SET status = 'processing'
		WHERE id = ?
	`).run(id);
}
