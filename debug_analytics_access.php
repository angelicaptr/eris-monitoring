<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Find a user with role 'developer'
// If no specific developer, just pick the first user and temporarily treat as dev for testing if needed,
// but better to find an actual developer if one exists from previous steps (user mentioned login differences).
// Let's dump all users first to pick one.
$users = \App\Models\User::all();
$devUser = null;
foreach ($users as $u) {
    if ($u->role === 'developer') {
        $devUser = $u;
        break;
    }
}

if (!$devUser) {
    echo "No developer found. Testing as Admin (User ID 1) to verify shared access.\n";
    $devUser = \App\Models\User::find(1);
}

echo "Testing as User: " . $devUser->name . " (Role: " . $devUser->role . ")\n";

try {
    // Test Analytics Summary
    $reqAn = Illuminate\Http\Request::create('/api/analytics/summary', 'GET', ['range' => '7_days']);
    $reqAn->setUserResolver(function () use ($devUser) {
        return $devUser;
    });

    // Resolve controller via container to handle dependencies
    $controllerAn = app()->make(\App\Http\Controllers\AnalitikController::class);

    $responseAn = $controllerAn->getSummary($reqAn);
    echo "Analytics Summary Status: " . $responseAn->getStatusCode() . "\n";
    echo "Analytics Summary Data: " . json_encode($responseAn->getData()) . "\n";

    // Test Analytics Top Errors
    $reqTop = Illuminate\Http\Request::create('/api/analytics/top-errors', 'GET', ['range' => '7_days']);
    $reqTop->setUserResolver(function () use ($devUser) {
        return $devUser;
    });
    $responseTop = $controllerAn->getTopErrors($reqTop);
    echo "Top Errors Status: " . $responseTop->getStatusCode() . "\n";
    echo "Top Errors Data: " . json_encode($responseTop->getData()) . "\n";

} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
