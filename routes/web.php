<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\OfficeController;
use App\Http\Controllers\ReportController;
use App\Models\Office;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/health-check', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
})->name('health-check');

// Home page with attendance interface
Route::get('/', function () {
    $data = [];
    
    if (auth()->check()) {
        $user = auth()->user();
        
        if ($user->isEmployee()) {
            $data['activeAttendance'] = $user->getTodayActiveAttendance();
            $data['offices'] = Office::active()->get(['id', 'name', 'address']);
        }
    }
    
    return Inertia::render('welcome', $data);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Attendance routes
    Route::controller(AttendanceController::class)->group(function () {
        Route::get('/attendance', 'index')->name('attendance.index');
        Route::post('/attendance', 'store')->name('attendance.store');
        Route::put('/attendance', 'update')->name('attendance.update');
        Route::get('/attendance/history', 'show')->name('attendance.history');
    });
    
    // Office management routes (Admin/HRD only)
    Route::resource('offices', OfficeController::class);
    
    // Employee management routes (Admin/HRD only)
    Route::controller(App\Http\Controllers\EmployeeController::class)->prefix('employees')->name('employees.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/{employee}', 'show')->name('show');
    });
    
    // Report routes (Admin/HRD only)
    Route::resource('reports', ReportController::class)->only(['index', 'show', 'create', 'edit']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';