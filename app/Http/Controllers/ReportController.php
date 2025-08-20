<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display attendance reports dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        // Get filter parameters
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $officeId = $request->office_id;
        $userId = $request->user_id;

        // Build attendance query
        $attendanceQuery = Attendance::with(['user', 'office'])
            ->whereBetween('check_in', [$startDate, $endDate]);

        if ($officeId) {
            $attendanceQuery->where('office_id', $officeId);
        }

        if ($userId) {
            $attendanceQuery->where('user_id', $userId);
        }

        $attendances = $attendanceQuery->latest('check_in')->paginate(20);

        // Calculate statistics
        $totalAttendances = $attendanceQuery->count();
        $completedAttendances = $attendanceQuery->where('status', 'completed')->count();
        $totalHours = $attendanceQuery->whereNotNull('work_duration')->sum('work_duration') / 60;
        $averageHours = $completedAttendances > 0 ? $totalHours / $completedAttendances : 0;

        // Get filter options
        $offices = Office::active()->orderBy('name')->get(['id', 'name']);
        $employees = User::employees()->active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/index', [
            'attendances' => $attendances,
            'statistics' => [
                'total_attendances' => $totalAttendances,
                'completed_attendances' => $completedAttendances,
                'total_hours' => round($totalHours, 2),
                'average_hours' => round($averageHours, 2),
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'office_id' => $officeId,
                'user_id' => $userId,
            ],
            'offices' => $offices,
            'employees' => $employees,
        ]);
    }

    /**
     * Display daily attendance report.
     */
    public function show(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $date = $request->date ? Carbon::parse($request->date) : today();
        $officeId = $request->office_id;

        $query = Attendance::with(['user', 'office'])
            ->whereDate('check_in', $date);

        if ($officeId) {
            $query->where('office_id', $officeId);
        }

        $attendances = $query->orderBy('check_in')->get();

        // Group by office if no specific office selected
        $attendancesByOffice = $officeId ? [$attendances] : $attendances->groupBy('office.name');

        $offices = Office::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/daily', [
            'attendances' => $attendances,
            'attendancesByOffice' => $attendancesByOffice,
            'date' => $date->format('Y-m-d'),
            'office_id' => $officeId,
            'offices' => $offices,
        ]);
    }

    /**
     * Display monthly attendance summary.
     */
    public function create(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $month = $request->month ? Carbon::createFromFormat('Y-m', $request->month) : now();
        $officeId = $request->office_id;

        // Get all employees for the selected office or all offices
        $employeesQuery = User::employees()->active()->with('office');
        
        if ($officeId) {
            $employeesQuery->where('office_id', $officeId);
        }

        $employees = $employeesQuery->get();

        // Calculate monthly statistics for each employee
        $monthlyData = $employees->map(function ($employee) use ($month, $officeId) {
            $attendances = $employee->attendances()
                ->whereMonth('check_in', $month->month)
                ->whereYear('check_in', $month->year);

            if ($officeId) {
                $attendances->where('office_id', $officeId);
            }

            $attendanceData = $attendances->get();
            
            $totalDays = $attendanceData->where('status', 'completed')->count();
            $totalHours = $attendanceData->where('work_duration', '>', 0)->sum('work_duration') / 60;
            $averageHours = $totalDays > 0 ? $totalHours / $totalDays : 0;

            return [
                'employee' => $employee,
                'total_days' => $totalDays,
                'total_hours' => round($totalHours, 2),
                'average_hours' => round($averageHours, 2),
                'incomplete_days' => $attendanceData->where('status', 'active')->count(),
            ];
        });

        $offices = Office::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/monthly', [
            'monthlyData' => $monthlyData,
            'month' => $month->format('Y-m'),
            'monthName' => $month->format('F Y'),
            'office_id' => $officeId,
            'offices' => $offices,
        ]);
    }

    /**
     * Display employee-specific attendance report.
     */
    public function edit(Request $request, User $employee)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();

        $attendances = $employee->attendances()
            ->with('office')
            ->whereBetween('check_in', [$startDate, $endDate])
            ->latest('check_in')
            ->paginate(20);

        // Calculate statistics
        $totalDays = $employee->attendances()
            ->whereBetween('check_in', [$startDate, $endDate])
            ->where('status', 'completed')
            ->count();

        $totalHours = $employee->attendances()
            ->whereBetween('check_in', [$startDate, $endDate])
            ->whereNotNull('work_duration')
            ->sum('work_duration') / 60;

        return Inertia::render('reports/employee', [
            'employee' => $employee->load('office'),
            'attendances' => $attendances,
            'statistics' => [
                'total_days' => $totalDays,
                'total_hours' => round($totalHours, 2),
                'average_hours' => $totalDays > 0 ? round($totalHours / $totalDays, 2) : 0,
            ],
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}