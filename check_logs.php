<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ErrorLog;

echo "Total Logs: " . ErrorLog::count() . "\n";
echo "Open Logs: " . ErrorLog::where('status', 'open')->count() . "\n";
echo "In Progress Logs: " . ErrorLog::where('status', 'in_progress')->count() . "\n";
echo "Resolved Logs: " . ErrorLog::where('status', 'resolved')->count() . "\n";

// Check if any recently updated log is 'in_progress'
$recent = ErrorLog::orderBy('updated_at', 'desc')->first();
if ($recent) {
    echo "\nMost recent log:\n";
    echo "ID: " . $recent->id . "\n";
    echo "Status: " . $recent->status . "\n";
    echo "Updated At: " . $recent->updated_at . "\n";
}
