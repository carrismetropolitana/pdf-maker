import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ChipInputProps {
	label: string;
	chips: string[];
	setChips: React.Dispatch<React.SetStateAction<string[]>>;
	placeholder: string;
	disabled: boolean;
	chipClassName: string;
}

export default function ChipInput({
	label,
	chips,
	setChips,
	placeholder,
	disabled,
	chipClassName,
}: ChipInputProps) {
	const [inputValue, setInputValue] = useState('');

	const handleChipInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (inputValue.trim()) {
				setChips((prevChips) => [...prevChips, inputValue.trim()]);
				setInputValue('');
			}
		}
	};

	const removeChip = (index: number) => {
		setChips(chips.filter((_, i) => i !== index));
	};

	return (
		<div>
			<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				{label}
			</label>
			<div className="flex flex-wrap gap-2 mb-2">
				{chips.map((chip, index) => (
					<span
						key={index}
						className={`${chipClassName} px-2 py-1 rounded-full text-sm flex items-center`}>
						{chip}
						<button
							className="ml-2"
							onClick={() => removeChip(index)}
							type="button">
							<X className="h-4 w-4" />
						</button>
					</span>
				))}
			</div>
			<Input
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				disabled={disabled}
				onKeyDown={handleChipInput}
				placeholder={placeholder}
			/>
		</div>
	);
}
