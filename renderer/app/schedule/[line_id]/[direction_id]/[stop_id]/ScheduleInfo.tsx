export default function ScheduleInfo({ name, startDate, stopId }:{name:string, startDate:string, stopId:string}) {
	return (
		<p className='text-[3mm]'>
			<span className='font-semibold'> Horário da paragem</span>: {name}.
			<span className='font-semibold'> Código de paragem:</span> #{stopId}
			<span className='font-semibold'> Horário atualizado em:</span> {startDate}
		</p>
	);
}