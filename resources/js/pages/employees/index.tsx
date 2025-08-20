import React from 'react';
import { Head } from '@inertiajs/react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Employee {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    role: 'employee' | 'admin' | 'hrd';
    is_active: boolean;
    office?: {
        id: number;
        name: string;
    };
    stats: {
        this_month_days: number;
        this_month_hours: number;
        active_today: boolean;
    };
    [key: string]: unknown;
}

interface Props {
    employees: {
        data: Employee[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        [key: string]: unknown;
    };
    offices: Array<{
        id: number;
        name: string;
    }>;
    filters: {
        role?: string;
        office_id?: number;
        status?: string;
    };
    [key: string]: unknown;
}

export default function EmployeesIndex({ employees, offices, filters }: Props) {
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="default">⚙️ Admin</Badge>;
            case 'hrd':
                return <Badge variant="secondary">👥 HRD</Badge>;
            case 'employee':
                return <Badge variant="outline">👤 Employee</Badge>;
            default:
                return <Badge variant="outline">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive: boolean, activeToday: boolean) => {
        if (!isActive) {
            return <Badge variant="destructive">❌ Inactive</Badge>;
        }
        if (activeToday) {
            return <Badge variant="default">🟢 Currently Active</Badge>;
        }
        return <Badge variant="outline">⭕ Not Checked In</Badge>;
    };

    return (
        <AppShell>
            <Head title="Employee Management" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">👥 Employee Management</h1>
                        <p className="text-gray-600">Manage employee data and view attendance statistics</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" asChild>
                            <a href="/reports">📊 View Reports</a>
                        </Button>
                        <Button asChild>
                            <a href="/dashboard">← Dashboard</a>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">🔍 Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form method="GET" className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select 
                                    name="role" 
                                    defaultValue={filters.role || ''} 
                                    className="border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Roles</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                    <option value="hrd">HRD</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Office</label>
                                <select 
                                    name="office_id" 
                                    defaultValue={filters.office_id || ''} 
                                    className="border rounded-md px-3 py-2 text-sm"
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
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select 
                                    name="status" 
                                    defaultValue={filters.status || ''} 
                                    className="border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>
                            
                            <div className="flex items-end">
                                <Button type="submit" size="sm">Apply Filters</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Employee List */}
                <div className="grid gap-4">
                    {employees.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <div className="text-gray-500">
                                    <div className="text-6xl mb-4">👥</div>
                                    <h3 className="text-lg font-medium mb-2">No employees found</h3>
                                    <p>Try adjusting your filters or check back later.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        employees.data.map((employee) => (
                            <Card key={employee.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold">{employee.name}</h3>
                                                {getRoleBadge(employee.role)}
                                                {getStatusBadge(employee.is_active, employee.stats.active_today)}
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div>📧 {employee.email}</div>
                                                <div>🆔 ID: {employee.employee_id}</div>
                                                {employee.office && (
                                                    <div>🏢 {employee.office.name}</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="space-y-2 mb-4">
                                                <div className="text-sm">
                                                    <span className="font-medium">This Month:</span>
                                                    <div className="text-gray-600">
                                                        📅 {employee.stats.this_month_days} days
                                                    </div>
                                                    <div className="text-gray-600">
                                                        ⏰ {Math.round(employee.stats.this_month_hours)} hours
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button size="sm" asChild>
                                                <a href={`/employees/${employee.id}`}>
                                                    👁️ View Details
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {employees.links && employees.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className="flex space-x-1">
                            {employees.links.map((link, index) => (
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
            </div>
        </AppShell>
    );
}