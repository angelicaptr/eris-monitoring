<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ErrorLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Set correct timezone for script execution context to match App Config
date_default_timezone_set('Asia/Jakarta');

echo "=== DEBUG ANALYTICS DATA (Asia/Jakarta) ===\n";
echo "Current Time: " . now()->toDateTimeString() . "\n";
echo "7 Days Ago: " . now()->subDays(7)->toDateTimeString() . "\n\n";

// Helper for date range
$startDate = now()->subDays(7)->startOfDay(); // 7 days ago 00:00
$endDate = now()->endOfDay(); // Today 23:59

echo "Filter Range: {$startDate} to {$endDate}\n\n";

// 1. RAW COUNTS (No scope, just DB)
echo "--- 1. RAW DB COUNTS (Last 7 Days) ---\n";
$rawTotal = ErrorLog::whereBetween('created_at', [$startDate, $endDate])->count();
echo "Total Errors: $rawTotal\n";

$rawCritical = ErrorLog::whereBetween('created_at', [$startDate, $endDate])
    ->where('severity', 'critical')
    ->count();
echo "Critical Errors: $rawCritical\n";

$rawResolved = ErrorLog::whereBetween('created_at', [$startDate, $endDate])
    ->where('status', 'resolved')
    ->count();
echo "Resolved Errors: $rawResolved\n\n";

// 2. DAILY TREND (Group by Date)
echo "--- 2. DAILY TREND (Logic: DATE(created_at + 7h)) ---\n";
$trends = ErrorLog::whereBetween('created_at', [$startDate, $endDate])
    ->selectRaw('DATE(DATE_ADD(created_at, INTERVAL 7 HOUR)) as date, COUNT(*) as count')
    ->groupBy('date')
    ->orderBy('date')
    ->get();

foreach ($trends as $t) {
    echo "Date: {$t->date} | Count: {$t->count}\n";
}
echo "\n";

// 3. ADMIN ROLE SIMULATION
$admin = User::where('role', 'admin')->first();
if ($admin) {
    echo "--- 3. ADMIN SIMULATION ({$admin->name}) ---\n";
    // Controller Logic Replication (Fixed with Start Day)
    $query = ErrorLog::query();
    $query->where('created_at', '>=', now()->subDays(6)->startOfDay());

    echo "Controller Logic (where >= now()->subDays(6)->startOfDay()): \n";
    echo "Cutoff time: " . now()->subDays(6)->startOfDay()->toDateTimeString() . "\n";
    $ctrlTotal = $query->count();
    echo "Admin Total (Controller Logic): $ctrlTotal\n";

    // Check difference between Rolling Window vs Start of Day
    $diff = $rawTotal - $ctrlTotal;
    echo "Difference (Rolling vs StartOfDay): $diff records\n";
    if ($diff > 0) {
        echo "POTENTIAL CAUSE: Controller uses sliding window (exact time), User expects Calendar Days.\n";
    }
}

// 4. CHECK SPECIFIC RECORDS AT BOUNDARIES
echo "\n--- 4. BOUNDARY CHECK (Oldest Records in Range) ---\n";
$oldest = ErrorLog::whereBetween('created_at', [$startDate, $endDate])
    ->orderBy('created_at', 'asc')
    ->limit(3)
    ->get();

foreach ($oldest as $log) {
    echo "ID: {$log->id} | Created: {$log->created_at} | +7h Date: " .
        Carbon::parse($log->created_at)->addHours(7)->toDateString() . "\n";
}
