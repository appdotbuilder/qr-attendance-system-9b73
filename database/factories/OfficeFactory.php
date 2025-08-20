<?php

namespace Database\Factories;

use App\Models\Office;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Office>
 */
class OfficeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<\App\Models\Office>
     */
    protected $model = Office::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' Office',
            'address' => fake()->address(),
            'latitude' => fake()->latitude(-6.5, -6.0), // Jakarta area
            'longitude' => fake()->longitude(106.5, 107.0), // Jakarta area
            'radius' => fake()->numberBetween(50, 200),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the office is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}