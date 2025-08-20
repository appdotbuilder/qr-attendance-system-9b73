<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\Attendance>
     */
    protected $model = Attendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $checkIn = fake()->dateTimeBetween('-30 days', 'now');
        $checkOut = fake()->boolean(80) ? fake()->dateTimeBetween($checkIn, 'now') : null;
        
        // Generate coordinates within office radius
        $office = Office::factory()->create();
        $distance = fake()->numberBetween(10, $office->radius);
        
        $workDuration = null;
        if ($checkOut) {
            $workDuration = fake()->numberBetween(300, 600); // 5-10 hours in minutes
        }

        return [
            'user_id' => User::factory(),
            'office_id' => $office->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'check_in_lat' => $office->latitude + (fake()->randomFloat(6, -0.001, 0.001)),
            'check_in_lng' => $office->longitude + (fake()->randomFloat(6, -0.001, 0.001)),
            'check_out_lat' => $checkOut ? $office->latitude + (fake()->randomFloat(6, -0.001, 0.001)) : null,
            'check_out_lng' => $checkOut ? $office->longitude + (fake()->randomFloat(6, -0.001, 0.001)) : null,
            'check_in_distance' => $distance,
            'check_out_distance' => $checkOut ? fake()->numberBetween(10, $office->radius) : null,
            'work_duration' => $workDuration,
            'notes' => fake()->optional()->sentence(),
            'status' => $checkOut ? 'completed' : 'active',
        ];
    }

    /**
     * Indicate that the attendance is active (not checked out).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'check_in' => fake()->dateTimeBetween('-1 hour', 'now'),
            'check_out' => null,
            'check_out_lat' => null,
            'check_out_lng' => null,
            'check_out_distance' => null,
            'work_duration' => null,
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the attendance is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'check_out' => fake()->dateTimeBetween($attributes['check_in'], 'now'),
            'check_out_lat' => $attributes['check_in_lat'] + fake()->randomFloat(6, -0.001, 0.001),
            'check_out_lng' => $attributes['check_in_lng'] + fake()->randomFloat(6, -0.001, 0.001),
            'check_out_distance' => fake()->numberBetween(10, 200),
            'work_duration' => fake()->numberBetween(300, 600),
            'status' => 'completed',
        ]);
    }
}