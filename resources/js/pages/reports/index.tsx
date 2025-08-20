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
    user: {
        id: number;
        name: string;
        employee_id: string;
    };
    office: {
        id: number;
        name: string;
    };
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
        total_attendances: number;
        completed_attendances: number;
        total_hours: number;
        average_hours: number;
    };
    filters: {
        start_date: string;
        end_date: string;
        office_id?: number;
        user_id?: number;
    };
    offices: Array<{
        id: number;
        name: string;
    }>;
    employees: Array<{
        id: number;
        name: string;
    }>;
    [key: string]: unknown;
}

export default function ReportsIndex({ attendances, statistics, filters, offices, employees }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
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
            <Head title="Attendance Reports" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📊 Attendance Reports</h1>
                        <p className="text-gray-600">Comprehensive attendance analytics and insights</p>
                    </div>
                    <Button asChild>
                        <a href="/dashboard">← Dashboard</a>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {statistics.total_attendances}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {statistics.completed_attendances}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {statistics.total_hours}h
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Average Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">
                                {statistics.average_hours}h
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">🔍 Filter Reports</CardTitle>
                        <CardDescription>Customize your attendance report view</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form method="GET" className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input 
                                    type="date" 
                                    name="start_date" 
                                    defaultValue={filters.start_date} 
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input 
                                    type="date" 
                                    name="end_date" 
                                    defaultValue={filters.end_date} 
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Office</label>
                                <select 
                                    name="office_id" 
                                    defaultValue={filters.office_id || ''} 
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Offices</option>
                                    {offices.map((office) => (
                                        <option key={office.id} value={office.id}>
                                            {office.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Employee</label>
                                <select 
                                    name="user_id" 
                                    defaultValue={filters.user_id || ''} 
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Employees</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-end">
                                <Button type="submit" className="w-full">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Attendance Records */}
                <Card>
                    <CardHeader>
                        <CardTitle>📅 Attendance Records</CardTitle>
                        <CardDescription>
                            Showing records from {new Date(filters.start_date).toLocaleDateString()} to {new Date(filters.end_date).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendances.data.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-6xl mb-4">📊</div>
                                    <h3 className="text-lg font-medium mb-2">No records found</h3>
                                    <p>Try adjusting your filters to see attendance data.</p>
                                </div>
                            ) : (
                                attendances.data.map((attendance) => (
                                    <div key={attendance.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="font-medium">{attendance.user.name}</h3>
                                                    <Badge variant="outline">
                                                        ID: {attendance.user.employee_id}
                                                    </Badge>
                                                    <Badge variant={attendance.status === 'completed' ? 'default' : 'secondary'}>
                                                        {attendance.status === 'completed' ? '✅ Completed' : '⏳ Active'}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div>🏢 {attendance.office.name}</div>
                                                    <div>
                                                        📅 Check-in: {formatDate(attendance.check_in)}
                                                        {attendance.check_out && (
                                                            <> • Check-out: {formatDate(attendance.check_out)}</>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                {attendance.work_duration && (
                                                    <div className="text-lg font-medium text-blue-600">
                                                        ⏰ {formatDuration(attendance.work_duration)}
                                                    </div>
                                                )}
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {new Date(attendance.check_in).toLocaleDateString()}
                                                </div>
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

                {/* Quick Report Links */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span>📈</span>
                                <span>Daily Reports</span>
                            </CardTitle>
                            <CardDescription>View attendance by specific dates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <a href="/reports?filter=daily">View Daily Reports</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span>📅</span>
                                <span>Monthly Summary</span>
                            </CardTitle>
                            <CardDescription>Monthly attendance statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <a href="/reports?filter=monthly">View Monthly Reports</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span>👤</span>
                                <span>Employee Reports</span>
                            </CardTitle>
                            <CardDescription>Individual employee analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <a href="/employees">View Employee Reports</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}