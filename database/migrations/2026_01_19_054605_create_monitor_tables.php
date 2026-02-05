<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->string('api_key')->unique();
            $table->boolean('is_active')->default(true); // Fitur toggle
            $table->timestamps();
        });

        Schema::create('error_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->longText('stack_trace');
            $table->enum('severity', ['warning', 'error', 'critical'])->default('error');

            $table->enum('status', ['open', 'in_progress', 'resolved'])->default('open');

            $table->foreignId('in_progress_by')->nullable()->constrained('users');
            $table->timestamp('in_progress_at')->nullable();

            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('error_logs');
        Schema::dropIfExists('applications');
    }
};