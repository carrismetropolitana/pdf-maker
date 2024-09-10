import { getUploadsAction } from '@/actions';
import UploadPage from '@/components/UploadPage';

export default async function Home() {
	
	const previousGenerations = await getUploadsAction();
	
	return (
		<div className="flex items-center h-full">
			<UploadPage initialPreviousGenerations={previousGenerations} />
		</div>
	);
}
