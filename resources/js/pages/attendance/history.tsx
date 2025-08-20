import React from 'react';
import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Attendance {
    id: number;
    check_in: string;
    check_out: string | null;
    work_duration: number | null;
    status: 'active' | 'completed';
    office: {
        id: number;
        name: string;
    };
    notes: string | null;
    [key: string]: unknown;
}

interface Props {
    attendances: {
        data: Attendance[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        [key: string]: unknown;
    };
    statistics: {
        total_hours: number;
        total_days: number;
        average_hours: number;
    };
    currentMonth: string;
    [key: string]: unknown;
}

export default function AttendanceHistory({ attendances, statistics, currentMonth }: Props) {
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <AppShell>
            <Head title="Attendance History" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📅 Attendance History</h1>
                        <p className="text-gray-600">View your attendance records and statistics</p>
                    </div>
                    <Button asChild>
                        <a href="/">← Back to Check-in</a>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {statistics.total_hours}h
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Days</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {statistics.total_days}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Average Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {statistics.average_hours}h
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Records */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Attendance Records</CardTitle>
                        <CardDescription>
                            Showing records for {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendances.data.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No attendance records found for this period.
                                </div>
                            ) : (
                                attendances.data.map((attendance) => (
                                    <div key={attendance.id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">{attendance.office.name}</h3>
                                                <div className="text-sm text-gray-600">
                                                    Check-in: {formatTime(attendance.check_in)}
                                                    {attendance.check_out && (
                                                        <> • Check-out: {formatTime(attendance.check_out)}</>
                                                    )}
                                                </div>
                                                {attendance.notes && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        📝 {attendance.notes}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={attendance.status === 'completed' ? 'default' : 'outline'}>
                                                    {attendance.status === 'completed' ? '✅ Completed' : '⏳ Active'}
                                                </Badge>
                                                {attendance.work_duration && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {formatDuration(attendance.work_duration)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {attendances.links && attendances.links.length > 3 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-1">
                                    {attendances.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <a href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}