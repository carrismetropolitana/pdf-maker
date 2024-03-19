export default function ScheduleInfo({ name, startDate, stopId }:{name:string, startDate:string, stopId:string}) {
	return (
		<div className='text-[3mm]'>
			<div><span className='font-semibold'> Horário da paragem</span>: {name}.</div>
			<div><span className='font-semibold'> Código de paragem:</span> #{stopId} </div>
			<div><span className='font-semibold'> Horário atualizado em:</span> {startDate}</div>
		</div>
	);
}