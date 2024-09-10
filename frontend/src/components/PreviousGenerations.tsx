import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { Download, Loader2, X } from 'lucide-react';
import { cancelProcessingAction } from '@/actions';
import { Upload } from '@/lib/db';

type ApiFile = Omit<Upload, "file">;

export default function PreviousGenerations({ previousGenerations, setPreviousGenerations }:{ previousGenerations: ApiFile[], setPreviousGenerations: (f:ApiFile[])=>void }) {
  const cancelProcessing = async (id: number) => {
    try {
      const result = await cancelProcessingAction(id);
      setPreviousGenerations(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Previous Generations</h2>
      <div className="space-y-2">
        {previousGenerations.map((generation, index) => (
          <div key={index} className="flex items-center justify-between w-full">
            <div>
              <div className="font-medium shrink">{generation.filename}</div>
              <div className="text-muted-foreground text-sm">{formatTime(generation.submissionTime)}</div>
            </div>
            {generation.status === 'processing' || generation.status == 'queued' ? (
              <div className="flex items-center">
                {generation.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <span className="text-sm text-muted-foreground mr-2">
                  {generation.status === 'processing' ? 'Processing' : 'Queued'}
                </span>
                <Button
                  className="h-8 w-8 p-0"
                  onClick={() => cancelProcessing(generation.id)}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <a href={generation.status} target="_blank">
                <Button size="sm" variant="outline">
                  <Download className="mr-2 w-4 h-4" />
                  Download
                </Button>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}