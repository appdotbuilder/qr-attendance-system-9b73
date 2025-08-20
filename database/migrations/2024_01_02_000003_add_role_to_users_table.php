<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['employee', 'admin', 'hrd'])->default('employee');
            $table->string('employee_id')->nullable()->unique();
            $table->foreignId('office_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_active')->default(true);
            
            // Indexes
            $table->index('role');
            $table->index('employee_id');
            $table->index(['role', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['office_id']);
            $table->dropIndex(['role', 'is_active']);
            $table->dropIndex('employee_id');
            $table->dropIndex('role');
            $table->dropColumn(['role', 'employee_id', 'office_id', 'is_active']);
        });
    }
};