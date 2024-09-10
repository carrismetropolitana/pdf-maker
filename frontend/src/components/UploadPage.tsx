'use client';

import { useState, useEffect } from 'react';
import { getUploadsAction } from '@/actions';
import { Upload } from '@/lib/db';
import FileUploadForm from './FileUploadForm';
import ProcessingLogs from './ProcessingLogs';
import PreviousGenerations from './PreviousGenerations';

export default function UploadPage({initialPreviousGenerations}:{initialPreviousGenerations:Omit<Upload, 'file'>[]}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [previousGenerations, setPreviousGenerations] = useState<Omit<Upload, 'file'>[]>(initialPreviousGenerations);


  useEffect(() => {
	  console.log(initialPreviousGenerations);
    const fetchData = async () => {
      try {
        const result = await getUploadsAction();
        setPreviousGenerations(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 grid md:grid-cols-[7fr_2fr] gap-12">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">GTFS to PDF Renderer</h1>
          <p className="text-muted-foreground">Upload a GTFS zip file and download the resulting schedules as PDFs.</p>
        </div>
        <FileUploadForm 
          setIsProcessing={setIsProcessing} 
          setLogs={setLogs} 
          setPreviousGenerations={setPreviousGenerations} 
        />
        <ProcessingLogs logs={logs} />
      </div>
      <PreviousGenerations 
        previousGenerations={previousGenerations} 
        setPreviousGenerations={setPreviousGenerations} 
      />
    </div>
  );
}