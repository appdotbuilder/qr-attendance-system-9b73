<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfficeRequest;
use App\Http\Requests\UpdateOfficeRequest;
use App\Models\Office;
use Inertia\Inertia;

class OfficeController extends Controller
{
    /**
     * Display a listing of offices.
     */
    public function index()
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $offices = Office::withCount(['users', 'attendances'])
                        ->latest()
                        ->paginate(10);

        return Inertia::render('offices/index', [
            'offices' => $offices
        ]);
    }

    /**
     * Show the form for creating a new office.
     */
    public function create()
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('offices/create');
    }

    /**
     * Store a newly created office.
     */
    public function store(StoreOfficeRequest $request)
    {
        $office = Office::create($request->validated());

        return redirect()->route('offices.show', $office)
            ->with('success', 'Office created successfully.');
    }

    /**
     * Display the specified office.
     */
    public function show(Office $office)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        $office->load(['users', 'attendances.user']);
        
        // Get recent attendances for this office
        $recentAttendances = $office->attendances()
                                   ->with('user')
                                   ->latest()
                                   ->take(10)
                                   ->get();

        return Inertia::render('offices/show', [
            'office' => $office,
            'recentAttendances' => $recentAttendances,
        ]);
    }

    /**
     * Show the form for editing the office.
     */
    public function edit(Office $office)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('offices/edit', [
            'office' => $office
        ]);
    }

    /**
     * Update the specified office.
     */
    public function update(UpdateOfficeRequest $request, Office $office)
    {
        $office->update($request->validated());

        return redirect()->route('offices.show', $office)
            ->with('success', 'Office updated successfully.');
    }

    /**
     * Remove the specified office.
     */
    public function destroy(Office $office)
    {
        $user = auth()->user();
        
        if (!$user->canManageEmployees()) {
            return redirect()->route('dashboard');
        }

        // Check if office has associated users or attendances
        if ($office->users()->count() > 0 || $office->attendances()->count() > 0) {
            return back()->withErrors([
                'error' => 'Cannot delete office with associated users or attendance records.'
            ]);
        }

        $office->delete();

        return redirect()->route('offices.index')
            ->with('success', 'Office deleted successfully.');
    }
}