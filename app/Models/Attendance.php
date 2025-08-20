<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\Attendance
 *
 * @property int $id
 * @property int $user_id
 * @property int $office_id
 * @property \Illuminate\Support\Carbon $check_in
 * @property \Illuminate\Support\Carbon|null $check_out
 * @property float $check_in_lat
 * @property float $check_in_lng
 * @property float|null $check_out_lat
 * @property float|null $check_out_lng
 * @property int $check_in_distance
 * @property int|null $check_out_distance
 * @property int|null $work_duration
 * @property string|null $notes
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Office $office
 * 
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance active()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance completed()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance today()
 * @method static \Illuminate\Database\Eloquent\Builder|Attendance thisMonth()
 * @method static \Database\Factories\AttendanceFactory factory($count = null, $state = [])
 * @method static Attendance create(array $attributes = [])
 * @method static Attendance firstOrCreate(array $attributes = [], array $values = [])
 * 
 * @mixin \Eloquent
 */
class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'office_id',
        'check_in',
        'check_out',
        'check_in_lat',
        'check_in_lng',
        'check_out_lat',
        'check_out_lng',
        'check_in_distance',
        'check_out_distance',
        'work_duration',
        'notes',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'check_in_lat' => 'decimal:8',
        'check_in_lng' => 'decimal:8',
        'check_out_lat' => 'decimal:8',
        'check_out_lng' => 'decimal:8',
        'check_in_distance' => 'integer',
        'check_out_distance' => 'integer',
        'work_duration' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the attendance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the office where attendance was recorded.
     */
    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    /**
     * Scope a query to only include active attendances.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include completed attendances.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include today's attendances.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeToday($query)
    {
        return $query->whereDate('check_in', today());
    }

    /**
     * Scope a query to only include this month's attendances.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('check_in', now()->month)
                    ->whereYear('check_in', now()->year);
    }

    /**
     * Calculate work duration when checking out.
     */
    public function calculateWorkDuration(): void
    {
        if ($this->check_out) {
            $this->work_duration = (int) $this->check_in->diffInMinutes($this->check_out);
        }
    }
}