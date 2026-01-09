import { useSchedule } from '../hooks/useSchedule';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { ScheduleCalendar } from '../components/calendar/ScheduleCalendar';
import { PlayCircle, Loader2, AlertCircle } from 'lucide-react';

export const Scheduler = () => {
  const {
    startGeneration,
    isGenerating,
    isComplete,
    progress,
    message,
    result,
    isError,
    error
  } = useSchedule();

  const handleStart = () => {
    // Pass default or user-configured constraints
    startGeneration({ semesterId: 'current-semester' });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Optimization</h1>
          <p className="text-slate-500">Generate optimal timetables using our AI Engine.</p>
        </div>

        {!isGenerating && !isComplete && (
          <Button onClick={handleStart} size="lg" className="gap-2">
            <PlayCircle size={16} />
            Start Optimization
          </Button>
        )}
      </div>

      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-4 text-red-700">
             <AlertCircle />
             <div>
               <h3 className="font-semibold">Optimization Failed</h3>
               <p>{error?.message || "An unexpected error occurred."}</p>
             </div>
             <Button variant="outline" className="ml-auto border-red-200 hover:bg-red-100 text-red-700" onClick={handleStart}>
               Retry
             </Button>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card className="w-full max-w-2xl mx-auto mt-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              Generating Schedule
            </CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <div className="text-xs text-slate-400 text-right">{progress}%</div>
          </CardContent>
        </Card>
      )}

      {isComplete && result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ScheduleCalendar events={result} />
          <div className="flex justify-end mt-4">
             <Button variant="outline" onClick={handleStart}>Regenerate</Button>
          </div>
        </div>
      )}

      {!isGenerating && !isComplete && !isError && (
        <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
           <p>No schedule generated yet. Click start to begin.</p>
        </div>
      )}
    </div>
  );
};
