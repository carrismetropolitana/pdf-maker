export default function ScheduleInfo({ name, startDate }:{name:string, startDate:string}) {
	return (
		<div className=' text-[3mm]'>
			<span className='font-semibold'>Horário de passagem</span> - {name}.
			<span className='font-semibold'>Data de início:</span> {startDate}
		</div>
	);
}