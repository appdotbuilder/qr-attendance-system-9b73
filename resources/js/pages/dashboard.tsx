import React from 'react';
import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: 'employee' | 'admin' | 'hrd';
            employee_id?: string;
            office?: {
                id: number;
                name: string;
            };
            [key: string]: unknown;
        };
    };
    stats?: {
        total_employees?: number;
        total_offices?: number;
        today_attendances?: number;
        active_attendances?: number;
    };

    [key: string]: unknown;
}

export default function Dashboard({ auth, stats }: Props) {
    const user = auth.user;

    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'admin':
                return { label: '⚙️ Administrator', color: 'default' as const };
            case 'hrd':
                return { label: '👥 Human Resources', color: 'secondary' as const };
            case 'employee':
                return { label: '👤 Employee', color: 'outline' as const };
            default:
                return { label: role, color: 'outline' as const };
        }
    };

    const roleInfo = getRoleDisplay(user.role);

    return (
        <AppShell>
            <Head title="Dashboard" />
            
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
                            <p className="text-blue-100 mt-2">
                                {user.role === 'employee' && user.office ? 
                                    `Assigned to ${user.office.name}` :
                                    'Manage your organization effectively'
                                }
                            </p>
                            {user.employee_id && (
                                <p className="text-blue-200 text-sm mt-1">ID: {user.employee_id}</p>
                            )}
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {roleInfo.label}
                        </Badge>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {user.role === 'employee' && (
                        <>
                            <Button className="h-16 flex-col space-y-1" asChild>
                                <a href="/">
                                    <span className="text-lg">📱</span>
                                    <span>Check In/Out</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col space-y-1" asChild>
                                <a href="/attendance/history">
                                    <span className="text-lg">📅</span>
                                    <span>My History</span>
                                </a>
                            </Button>
                        </>
                    )}

                    {(user.role === 'admin' || user.role === 'hrd') && (
                        <>
                            <Button className="h-16 flex-col space-y-1" asChild>
                                <a href="/reports">
                                    <span className="text-lg">📊</span>
                                    <span>Reports</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col space-y-1" asChild>
                                <a href="/offices">
                                    <span className="text-lg">🏢</span>
                                    <span>Offices</span>
                                </a>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col space-y-1" asChild>
                                <a href="/employees">
                                    <span className="text-lg">👥</span>
                                    <span>Employees</span>
                                </a>
                            </Button>
                        </>
                    )}

                    <Button variant="outline" className="h-16 flex-col space-y-1" asChild>
                        <a href="/settings">
                            <span className="text-lg">⚙️</span>
                            <span>Settings</span>
                        </a>
                    </Button>
                </div>

                {/* Statistics for Admin/HRD */}
                {(user.role === 'admin' || user.role === 'hrd') && stats && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_employees || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Office Locations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_offices || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.today_attendances || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active_attendances || 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>📋 Quick Links</CardTitle>
                            <CardDescription>Frequently used features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user.role === 'employee' ? (
                                <>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/">🏃‍♂️ Quick Check-in/out</a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/attendance/history">📊 View My Statistics</a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/profile">👤 Update Profile</a>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/reports/daily">📈 Today's Report</a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/reports/monthly">📅 Monthly Summary</a>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <a href="/offices/create">🏢 Add New Office</a>
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>ℹ️ System Status</CardTitle>
                            <CardDescription>Current system information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">System Status</span>
                                <Badge variant="default">🟢 Online</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">GPS Tracking</span>
                                <Badge variant="default">🟢 Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">QR Code Scanner</span>
                                <Badge variant="default">🟢 Available</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Last Backup</span>
                                <span className="text-sm text-gray-600">Today, 3:00 AM</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Help & Support */}
                <Card>
                    <CardHeader>
                        <CardTitle>🆘 Need Help?</CardTitle>
                        <CardDescription>Get support and learn about features</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/help/qr-scanner">📱 QR Code Guide</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/help/gps">📍 GPS Setup</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/help/reports">📊 Reports Guide</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/support">💬 Contact Support</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}