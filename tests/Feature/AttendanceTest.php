<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_page_displays_attendance_interface_for_employees(): void
    {
        $office = Office::factory()->create();
        $employee = User::factory()->employee()->create([
            'office_id' => $office->id,
        ]);

        $response = $this->actingAs($employee)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('welcome')
                 ->has('offices')
                 ->where('auth.user.role', 'employee')
        );
    }

    public function test_employee_can_check_in(): void
    {
        $office = Office::factory()->create([
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius' => 100,
        ]);
        
        $employee = User::factory()->employee()->create([
            'office_id' => $office->id,
        ]);

        $checkInData = [
            'office_id' => $office->id,
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'notes' => 'Test check-in',
        ];

        $response = $this->actingAs($employee)->post('/attendance', $checkInData);

        $response->assertRedirect('/');
        $this->assertDatabaseHas('attendances', [
            'user_id' => $employee->id,
            'office_id' => $office->id,
            'status' => 'active',
        ]);
    }

    public function test_employee_cannot_check_in_outside_office_radius(): void
    {
        $office = Office::factory()->create([
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius' => 50,
        ]);
        
        $employee = User::factory()->employee()->create([
            'office_id' => $office->id,
        ]);

        // Coordinates far from office
        $checkInData = [
            'office_id' => $office->id,
            'latitude' => -6.3000,
            'longitude' => 106.9000,
            'notes' => 'Test check-in',
        ];

        $response = $this->actingAs($employee)->post('/attendance', $checkInData);

        $response->assertRedirect('/');
        $response->assertSessionHasErrors('location');
        $this->assertDatabaseMissing('attendances', [
            'user_id' => $employee->id,
            'office_id' => $office->id,
        ]);
    }

    public function test_employee_can_check_out(): void
    {
        $office = Office::factory()->create([
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'radius' => 100,
        ]);
        
        $employee = User::factory()->employee()->create();
        
        // Create an active attendance
        $attendance = Attendance::create([
            'user_id' => $employee->id,
            'office_id' => $office->id,
            'check_in' => now()->subHour(),
            'check_in_lat' => -6.2088,
            'check_in_lng' => 106.8456,
            'check_in_distance' => 50,
            'status' => 'active',
        ]);

        $checkOutData = [
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'notes' => 'Test check-out',
        ];

        $response = $this->actingAs($employee)->put('/attendance', $checkOutData);

        $response->assertRedirect('/');
        $attendance->refresh();
        
        $this->assertEquals('completed', $attendance->status);
        $this->assertNotNull($attendance->check_out);
        $this->assertNotNull($attendance->work_duration);
    }

    public function test_admin_can_access_reports(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/reports');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('reports/index')
        );
    }

    public function test_employee_cannot_access_admin_routes(): void
    {
        $employee = User::factory()->employee()->create();

        $response = $this->actingAs($employee)->get('/reports');
        $response->assertRedirect('/dashboard');

        $response = $this->actingAs($employee)->get('/offices');
        $response->assertRedirect('/dashboard');
    }

    public function test_office_distance_calculation(): void
    {
        $lat1 = -6.2088;
        $lng1 = 106.8456;
        $lat2 = -6.2090;
        $lng2 = 106.8458;

        $distance = Office::calculateDistance($lat1, $lng1, $lat2, $lng2);

        $this->assertIsFloat($distance);
        $this->assertLessThan(100, $distance); // Should be less than 100 meters
    }

    public function test_user_role_methods(): void
    {
        $employee = User::factory()->employee()->create();
        $admin = User::factory()->admin()->create();
        $hrd = User::factory()->hrd()->create();

        $this->assertTrue($employee->isEmployee());
        $this->assertFalse($employee->isAdmin());
        $this->assertFalse($employee->canManageEmployees());

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isEmployee());
        $this->assertTrue($admin->canManageEmployees());

        $this->assertTrue($hrd->isHrd());
        $this->assertFalse($hrd->isEmployee());
        $this->assertTrue($hrd->canManageEmployees());
    }
}