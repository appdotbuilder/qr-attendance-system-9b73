<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create offices
        $offices = Office::factory(3)->create([
            'name' => fn () => fake()->randomElement([
                'Headquarters Jakarta',
                'Branch Office Surabaya', 
                'Regional Office Bandung'
            ])
        ]);

        // Create users with different roles
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@attendance.com',
            'office_id' => $offices->first()->id,
        ]);

        $hrd = User::factory()->hrd()->create([
            'name' => 'HRD Manager',
            'email' => 'hrd@attendance.com',
            'office_id' => $offices->first()->id,
        ]);

        // Create employees for each office
        foreach ($offices as $office) {
            $employees = User::factory(random_int(5, 10))->employee()->create([
                'office_id' => $office->id,
            ]);

            // Create attendance records for employees
            foreach ($employees as $employee) {
                // Create attendance for the last 30 days
                for ($i = 30; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    
                    // 80% chance of attendance on weekdays
                    if ($date->isWeekday() && fake()->boolean(80)) {
                        Attendance::factory()->create([
                            'user_id' => $employee->id,
                            'office_id' => $office->id,
                            'check_in' => $date->setTime(random_int(7, 9), random_int(0, 59)),
                            'status' => fake()->boolean(90) ? 'completed' : 'active',
                        ]);
                    }
                }
            }
        }

        $this->command->info('Created ' . Office::count() . ' offices');
        $this->command->info('Created ' . User::count() . ' users');
        $this->command->info('Created ' . Attendance::count() . ' attendance records');
    }
}