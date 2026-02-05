<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "DB: " . \Illuminate\Support\Facades\DB::connection()->getDatabaseName() . "\n";
    $query = \App\Models\User::where('role', 'developer');
    echo "SQL: " . $query->toSql() . "\n";

    // Attempt execution
    $users = $query->get();
    echo "Found: " . $users->count() . "\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
