
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { OptimizationJob } from '../api/types';
import { Play, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface OptimizationPanelProps {
    job: OptimizationJob | null;
    isStarting: boolean;
    onStartOptimization: () => void;
    onReset: () => void;
    isAuthenticated: boolean;
    onRequireLogin: () => void;
}

export function OptimizationPanel({
    job,
    isStarting,
    onStartOptimization,
    onReset,
    isAuthenticated,
    onRequireLogin,
}: OptimizationPanelProps) {
    const getStatusBadge = () => {
        if (!job) return null;

        switch (job.status) {
            case 'PENDING':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'RUNNING':
                return <Badge variant="warning"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
            case 'COMPLETED':
                return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
            case 'FAILED':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
        }
    };

    const isRunning = job?.status === 'RUNNING' || job?.status === 'PENDING';
    const isCompleted = job?.status === 'COMPLETED';

    return (
        <Card className="card-hover">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Schedule Optimization</CardTitle>
                    {getStatusBadge()}
                </div>
                <CardDescription>
                    Run the AI-powered solver to generate an optimal schedule
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {job && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} />
                    </div>
                )}

                {isCompleted && job?.result?.score && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hard Score:</span>
                            <span className={job.result.score.hardScore === 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {job.result.score.hardScore}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Soft Score:</span>
                            <span className="text-amber-400">{job.result.score.softScore}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={() => isAuthenticated ? onStartOptimization() : onRequireLogin()}
                        disabled={isStarting || isRunning}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                    >
                        {isStarting || isRunning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Start Optimization
                            </>
                        )}
                    </Button>

                    {isCompleted && (
                        <Button variant="outline" onClick={onReset}>
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
