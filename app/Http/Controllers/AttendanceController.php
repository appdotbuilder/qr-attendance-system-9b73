<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Models\Attendance;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display the attendance interface.
     */
    public function index()
    {
        $user = auth()->user();
        
        if (!$user->isEmployee()) {
            return redirect()->route('dashboard');
        }

        $activeAttendance = $user->getTodayActiveAttendance();
        $offices = Office::active()->get();
        
        $recentAttendances = $user->attendances()
                                 ->with('office')
                                 ->latest()
                                 ->take(5)
                                 ->get();

        return Inertia::render('attendance/index', [
            'activeAttendance' => $activeAttendance?->load('office'),
            'offices' => $offices,
            'recentAttendances' => $recentAttendances,
        ]);
    }

    /**
     * Handle employee check-in.
     */
    public function store(CheckInRequest $request)
    {
        $user = auth()->user();
        
        // Check if already checked in today
        $activeAttendance = $user->getTodayActiveAttendance();
        if ($activeAttendance) {
            return back()->withErrors(['error' => 'You are already checked in today.']);
        }

        $office = Office::findOrFail($request->office_id);
        
        // Calculate distance from office
        $distance = Office::calculateDistance(
            $request->latitude,
            $request->longitude,
            $office->latitude,
            $office->longitude
        );

        // Check if within allowed radius
        if ($distance > $office->radius) {
            return back()->withErrors([
                'location' => "You are {$distance}m away from the office. Please move closer (within {$office->radius}m) to check in."
            ]);
        }

        $attendance = Attendance::create([
            'user_id' => $user->id,
            'office_id' => $office->id,
            'check_in' => now(),
            'check_in_lat' => $request->latitude,
            'check_in_lng' => $request->longitude,
            'check_in_distance' => $distance,
            'notes' => $request->notes,
            'status' => 'active',
        ]);

        return back()->with('success', "Successfully checked in at {$office->name}!");
    }

    /**
     * Handle employee check-out.
     */
    public function update(CheckOutRequest $request)
    {
        $user = auth()->user();
        
        $attendance = $user->getTodayActiveAttendance();
        if (!$attendance) {
            return back()->withErrors(['error' => 'No active attendance found for today.']);
        }

        // Calculate distance from office
        $distance = Office::calculateDistance(
            $request->latitude,
            $request->longitude,
            $attendance->office->latitude,
            $attendance->office->longitude
        );

        // Check if within allowed radius
        if ($distance > $attendance->office->radius) {
            return back()->withErrors([
                'location' => "You are {$distance}m away from the office. Please move closer (within {$attendance->office->radius}m) to check out."
            ]);
        }

        $attendance->update([
            'check_out' => now(),
            'check_out_lat' => $request->latitude,
            'check_out_lng' => $request->longitude,
            'check_out_distance' => $distance,
            'notes' => $request->notes ? $attendance->notes . "\n" . $request->notes : $attendance->notes,
            'status' => 'completed',
        ]);

        $attendance->calculateWorkDuration();
        $attendance->save();

        $hours = floor($attendance->work_duration / 60);
        $minutes = $attendance->work_duration % 60;

        return back()->with('success', "Successfully checked out! Work duration: {$hours}h {$minutes}m");
    }

    /**
     * Display attendance history.
     */
    public function show(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->isEmployee()) {
            return redirect()->route('dashboard');
        }

        $query = $user->attendances()->with('office');

        // Filter by month if provided
        if ($request->month) {
            $date = \Carbon\Carbon::createFromFormat('Y-m', $request->month);
            $query->whereMonth('check_in', $date->month)
                  ->whereYear('check_in', $date->year);
        }

        $attendances = $query->latest('check_in')->paginate(15);
        
        // Calculate statistics
        $totalHours = $attendances->where('work_duration', '>', 0)->sum('work_duration') / 60;
        $totalDays = $attendances->where('status', 'completed')->count();

        return Inertia::render('attendance/history', [
            'attendances' => $attendances,
            'statistics' => [
                'total_hours' => round($totalHours, 2),
                'total_days' => $totalDays,
                'average_hours' => $totalDays > 0 ? round($totalHours / $totalDays, 2) : 0,
            ],
            'currentMonth' => $request->month ?: now()->format('Y-m'),
        ]);
    }
}