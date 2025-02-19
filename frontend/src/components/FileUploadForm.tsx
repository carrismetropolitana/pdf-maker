import { useMemo, useState } from 'react';
import { submitFile } from '@/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import ChipInput from './ChipInput';

export default function FileUploadForm({
	setIsProcessing,
	setPreviousGenerations,
}: {
	setIsProcessing: (f: boolean) => void;
	setLogs: (f: string[]) => void;
	setPreviousGenerations: (f: any) => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [area, setArea] = useState<string>('');
	const [wantedLines, setWantedLines] = useState<string[]>([]);
	const [excludedLines, setExcludedLines] = useState<string[]>([]);
	const [validFrom, setValidFrom] = useState<Date>();
	const [sortBy, setSortBy] = useState<'stop' | 'line'>('stop');

	const canSave = useMemo(
		() => file && area && validFrom,
		[file, area, validFrom]
	);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files) {
			setFile(event.target.files[0]);
		}
	};

	const formAction = async (form: FormData) => {
		if (!file || !area || !validFrom) {
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('area', area);
		wantedLines.forEach((line) => formData.append('wantedLines', line));
		excludedLines.forEach((line) => formData.append('excludedLines', line));
		formData.append('sortBy', sortBy);
		const formattedValidFrom = format(validFrom, 'dd.MM.yyyy');
		formData.append('validFrom', formattedValidFrom);

		const previous = await submitFile(formData);
		setPreviousGenerations(previous);
		setIsProcessing(true);
		setTimeout(() => {
			setIsProcessing(false);
		}, 10000);
	};

	return (
		<form action={formAction} className="space-y-4">
			<div className="grid gap-2">
				<Label htmlFor="gtfs-file">GTFS File</Label>
				<Input
					accept=".zip"
					className="flex-1"
					id="gtfs-file"
					onChange={handleFileChange}
					type="file"
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="area">Area</Label>
				<Select onValueChange={setArea} value={area}>
					<SelectTrigger id="area">
						<SelectValue placeholder="Select an area" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1">Area 1</SelectItem>
						<SelectItem value="2">Area 2</SelectItem>
						<SelectItem value="3">Area 3</SelectItem>
						<SelectItem value="4">Area 4</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="sort-by">Sort By</Label>
				<Select
					onValueChange={(value) =>
						setSortBy(value as 'stop' | 'line')
					}
					value={sortBy}>
					<SelectTrigger id="sort-by">
						<SelectValue placeholder="Select a sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="stop">Stop</SelectItem>
						<SelectItem value="line">Line</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<ChipInput
				label="Wanted Lines"
				chips={wantedLines}
				setChips={setWantedLines}
				placeholder="Add wanted lines"
				disabled={excludedLines.length > 0}
				chipClassName="bg-accent text-accent-foreground"
			/>
			<ChipInput
				label="Excluded Lines"
				chips={excludedLines}
				setChips={setExcludedLines}
				placeholder="Add excluded lines"
				disabled={wantedLines.length > 0}
				chipClassName="bg-destructive text-destructive-foreground"
			/>
			<div className="grid gap-2">
				<Label htmlFor="valid-from">Valid From</Label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							id="valid-from"
							variant="outline"
							className={cn(
								'w-full justify-start text-left font-normal',
								!validFrom && 'text-muted-foreground'
							)}>
							<CalendarDays className="mr-2 h-4 w-4" />
							{validFrom ? (
								format(validFrom, 'PPP')
							) : (
								<span>Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-auto p-0">
						<Calendar
							mode="single"
							onSelect={setValidFrom}
							selected={validFrom}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex justify-end">
				<Button type="submit" disabled={!canSave}>
					Submit
					<ArrowRight className="ml-2 w-4 h-4" />
				</Button>
			</div>
		</form>
	);
}
