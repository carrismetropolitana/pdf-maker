import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProcessingLogs({ logs }: { logs: string[] }) {
  return (
    <div className="space-y-2">
      <Accordion type="single" collapsible>
        <AccordionItem value="processing-logs">
          <AccordionTrigger className="text-base">View Processing Logs</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-medium">Step {index + 1}:</span>
                  <span className="text-muted-foreground">{log}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}