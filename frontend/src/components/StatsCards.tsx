
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Timetable } from '../api/types';
import { Users, BookOpen, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
    timetable: Timetable | undefined;
    isLoading: boolean;
}

export function StatsCards({ timetable, isLoading }: StatsCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 w-20 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalLessons = timetable?.lessons?.length ?? 0;
    const scheduledLessons = timetable?.lessons?.filter(l => l.timeslot && l.room).length ?? 0;
    const totalRooms = timetable?.rooms?.length ?? 0;
    const uniqueGroups = new Set(timetable?.lessons?.map(l => l.studentGroup)).size;
    const pinnedLessons = timetable?.lessons?.filter(l => l.pinned).length ?? 0;
    const hardScore = timetable?.score?.hardScore ?? 0;
    const softScore = timetable?.score?.softScore ?? 0;

    const stats = [
        {
            title: 'Total Courses',
            value: totalLessons,
            description: `${scheduledLessons} scheduled`,
            icon: BookOpen,
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/10',
        },
        {
            title: 'Student Groups',
            value: uniqueGroups,
            description: 'Active groups',
            icon: Users,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Rooms',
            value: totalRooms,
            description: 'Available',
            icon: MapPin,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Schedule Score',
            value: hardScore === 0 ? 'Optimal' : 'Suboptimal',
            description: `Soft: ${softScore}`,
            icon: hardScore === 0 ? CheckCircle2 : AlertTriangle,
            color: hardScore === 0 ? 'text-emerald-400' : 'text-amber-400',
            bgColor: hardScore === 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            badge: pinnedLessons > 0 ? `${pinnedLessons} pinned` : undefined,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title} className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">{stat.value}</div>
                            {stat.badge && (
                                <Badge variant="secondary" className="text-xs">{stat.badge}</Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
