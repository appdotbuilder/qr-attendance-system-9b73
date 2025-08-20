<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $query = User::with(['office', 'attendances' => function ($query) {
            $query->whereBetween('check_in', [now()->startOfMonth(), now()->endOfMonth()]);
        }]);

        // Filter by role
        if ($request->role && in_array($request->role, ['employee', 'admin', 'hrd'])) {
            $query->where('role', $request->role);
        } else {
            $query->employees(); // Default to employees only
        }

        // Filter by office
        if ($request->office_id) {
            $query->where('office_id', $request->office_id);
        }

        // Filter by status
        if ($request->status !== null) {
            $query->where('is_active', $request->status === '1');
        }

        $employees = $query->latest()->paginate(15);

        // Add attendance statistics for each employee
        $employees->getCollection()->transform(function ($employee) {
            $thisMonthAttendances = $employee->attendances->where('check_in', '>=', now()->startOfMonth());
            $completedAttendances = $thisMonthAttendances->where('status', 'completed');
            
            // Add stats as an attribute
            $employee->setAttribute('stats', [
                'this_month_days' => $completedAttendances->count(),
                'this_month_hours' => $completedAttendances->sum('work_duration') / 60,
                'active_today' => $employee->getTodayActiveAttendance() !== null,
            ]);
            
            unset($employee->attendances); // Remove to reduce payload
            return $employee;
        });

        $offices = Office::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'offices' => $offices,
            'filters' => [
                'role' => $request->role,
                'office_id' => $request->office_id,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified employee.
     */
    public function show(User $employee)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $employee->load(['office']);
        
        // Get recent attendances
        $recentAttendances = $employee->attendances()
            ->with('office')
            ->latest()
            ->take(10)
            ->get();

        // Calculate monthly statistics
        $monthlyStats = $employee->attendances()
            ->whereMonth('check_in', now()->month)
            ->whereYear('check_in', now()->year)
            ->get()
            ->groupBy('status');

        $completedThisMonth = $monthlyStats->get('completed', collect());
        $totalHours = $completedThisMonth->sum('work_duration') / 60;

        return Inertia::render('employees/show', [
            'employee' => $employee,
            'recentAttendances' => $recentAttendances,
            'statistics' => [
                'completed_days' => $completedThisMonth->count(),
                'total_hours' => round($totalHours, 2),
                'average_hours' => $completedThisMonth->count() > 0 ? round($totalHours / $completedThisMonth->count(), 2) : 0,
                'active_sessions' => $monthlyStats->get('active', collect())->count(),
            ],
        ]);
    }
}