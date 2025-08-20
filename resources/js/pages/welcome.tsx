import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Clock, QrCode, Users, BarChart3, Shield, Smartphone } from '@/components/icons';

interface Props {
    auth?: {
        user?: {
            id: number;
            name: string;
            email: string;
            role: 'employee' | 'admin' | 'hrd';
            [key: string]: unknown;
        };
    };
    activeAttendance?: {
        id: number;
        check_in: string;
        office: {
            id: number;
            name: string;
        };
        [key: string]: unknown;
    };
    offices?: Array<{
        id: number;
        name: string;
        address: string;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
}

export default function Welcome({ auth, activeAttendance, offices = [] }: Props) {
    const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
    const [locationError, setLocationError] = useState<string>('');
    const [selectedOffice, setSelectedOffice] = useState<number | null>(null);
    const [notes, setNotes] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (auth?.user?.role === 'employee') {
            getCurrentLocation();
        }
    }, [auth]);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError('');
            },
            () => {
                setLocationError('Unable to get location. Please enable location access.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    const handleCheckIn = () => {
        if (!currentLocation) {
            setLocationError('Location is required for check-in');
            return;
        }

        if (!selectedOffice) {
            setLocationError('Please select an office');
            return;
        }

        setIsLoading(true);
        router.post('/attendance', {
            office_id: selectedOffice,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            notes: notes,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleCheckOut = () => {
        if (!currentLocation) {
            setLocationError('Location is required for check-out');
            return;
        }

        setIsLoading(true);
        router.put('/attendance', {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            notes: notes,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getWorkDuration = () => {
        if (!activeAttendance) return '';
        
        const checkIn = new Date(activeAttendance.check_in);
        const now = new Date();
        const diffMs = now.getTime() - checkIn.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${diffHours}h ${diffMinutes}m`;
    };

    return (
        <>
            <Head title="📱 Smart Attendance - QR Code & GPS Tracking" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <QrCode className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Smart Attendance</h1>
                                    <p className="text-sm text-gray-600">QR Code & GPS Tracking System</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth?.user ? (
                                    <div className="flex items-center space-x-3">
                                        <Badge variant={
                                            auth.user.role === 'admin' ? 'default' : 
                                            auth.user.role === 'hrd' ? 'secondary' : 
                                            'outline'
                                        }>
                                            {auth.user.role.toUpperCase()}
                                        </Badge>
                                        <span className="text-sm font-medium">{auth.user.name}</span>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href="/dashboard">Dashboard</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex space-x-3">
                                        <Button variant="outline" asChild>
                                            <a href="/login">Login</a>
                                        </Button>
                                        <Button asChild>
                                            <a href="/register">Register</a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Employee Attendance Interface */}
                    {auth?.user?.role === 'employee' && (
                        <div className="mb-12">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Welcome back, {auth.user.name}! 👋
                                </h2>
                                <p className="text-lg text-gray-600">
                                    {activeAttendance ? 
                                        `You're currently at ${activeAttendance.office.name} • ${getWorkDuration()}` :
                                        'Ready to start your workday?'
                                    }
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Attendance Card */}
                                <Card className="bg-white/80 backdrop-blur-sm border-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5" />
                                            <span>{activeAttendance ? 'Check Out' : 'Check In'}</span>
                                        </CardTitle>
                                        <CardDescription>
                                            {activeAttendance ? 
                                                `Checked in at ${formatTime(activeAttendance.check_in)}` :
                                                'Start your work session'
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {!activeAttendance && (
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Select Office</label>
                                                <select 
                                                    value={selectedOffice || ''} 
                                                    onChange={(e) => setSelectedOffice(Number(e.target.value))}
                                                    className="w-full p-2 border rounded-md"
                                                >
                                                    <option value="">Choose an office...</option>
                                                    {offices.map((office) => (
                                                        <option key={office.id} value={office.id}>
                                                            {office.name} - {office.address}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full p-2 border rounded-md resize-none"
                                                rows={3}
                                                placeholder="Any additional notes..."
                                            />
                                        </div>

                                        {locationError && (
                                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                <span className="text-sm text-red-700">{locationError}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>
                                                {currentLocation ? 
                                                    `Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}` :
                                                    'Getting location...'
                                                }
                                            </span>
                                        </div>

                                        <div className="flex space-x-3">
                                            <Button 
                                                onClick={getCurrentLocation}
                                                variant="outline" 
                                                className="flex-1"
                                            >
                                                📍 Refresh Location
                                            </Button>
                                            <Button 
                                                onClick={activeAttendance ? handleCheckOut : handleCheckIn}
                                                disabled={isLoading || !currentLocation}
                                                className={`flex-1 ${activeAttendance ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            >
                                                {isLoading ? '⏳ Processing...' : (activeAttendance ? '🏁 Check Out' : '🚀 Check In')}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href="/attendance/history">
                                                📅 View Attendance History
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href="/qr-scanner">
                                                📱 QR Code Scanner
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href="/profile">
                                                👤 Update Profile
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Admin/HRD Interface */}
                    {(auth?.user?.role === 'admin' || auth?.user?.role === 'hrd') && (
                        <div className="mb-12">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    {auth.user.role === 'admin' ? '⚙️ Admin Dashboard' : '👥 HRD Dashboard'}
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Manage attendance, employees, and generate reports
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                            <span>Attendance Reports</span>
                                        </CardTitle>
                                        <CardDescription>View daily, monthly, and employee reports</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <a href="/reports">📊 View Reports</a>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <MapPin className="h-5 w-5 text-green-600" />
                                            <span>Office Management</span>
                                        </CardTitle>
                                        <CardDescription>Manage office locations and settings</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <a href="/offices">🏢 Manage Offices</a>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5 text-purple-600" />
                                            <span>Employee Management</span>
                                        </CardTitle>
                                        <CardDescription>Manage employee data and permissions</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <a href="/employees">👥 Manage Employees</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Features Section - For Non-Authenticated Users */}
                    {!auth?.user && (
                        <div className="mb-12">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                    🚀 Modern Attendance Tracking
                                </h2>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Streamline your workforce management with QR code scanning, 
                                    GPS verification, and comprehensive reporting.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                            <QrCode className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <CardTitle>QR Code Scanning</CardTitle>
                                        <CardDescription>
                                            Quick check-in/out using mobile phone camera
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                            <MapPin className="h-6 w-6 text-green-600" />
                                        </div>
                                        <CardTitle>GPS Verification</CardTitle>
                                        <CardDescription>
                                            Ensure employees are at designated office locations
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                            <BarChart3 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <CardTitle>Comprehensive Reports</CardTitle>
                                        <CardDescription>
                                            Daily, monthly, and per-employee attendance analytics
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                            <Users className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <CardTitle>Role-Based Access</CardTitle>
                                        <CardDescription>
                                            Employee, Admin, and HRD user roles with appropriate permissions
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                            <Smartphone className="h-6 w-6 text-red-600" />
                                        </div>
                                        <CardTitle>Mobile Optimized</CardTitle>
                                        <CardDescription>
                                            Perfect mobile experience for on-the-go attendance
                                        </CardDescription>
                                    </CardHeader>
                                </Card>

                                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                                            <Shield className="h-6 w-6 text-teal-600" />
                                        </div>
                                        <CardTitle>Secure & Reliable</CardTitle>
                                        <CardDescription>
                                            Enterprise-grade security with real-time data sync
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            <div className="text-center mt-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h3>
                                <div className="flex justify-center space-x-4">
                                    <Button size="lg" asChild>
                                        <a href="/register">🚀 Sign Up Now</a>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <a href="/login">📱 Login</a>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <QrCode className="h-8 w-8" />
                            <span className="text-2xl font-bold">Smart Attendance</span>
                        </div>
                        <p className="text-gray-400 mb-6">
                            The future of workforce management is here. 
                            Track attendance with precision and ease.
                        </p>
                        <div className="flex justify-center space-x-8 text-sm text-gray-500">
                            <span>📱 QR Code Technology</span>
                            <span>🌍 GPS Verification</span>
                            <span>📊 Advanced Analytics</span>
                            <span>🔒 Enterprise Security</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}