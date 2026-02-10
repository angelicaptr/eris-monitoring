<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = \App\Models\User::where('role', 'admin')->first();
if (!$admin) {
    die("No admin found.\n");
}
echo "Testing as Admin: " . $admin->name . "\n";

$controller = app()->make(\App\Http\Controllers\AnalitikController::class);
$endpoints = [
    'getSummary' => '/api/analytics/summary',
    'getTopErrors' => '/api/analytics/top-errors',
    'getAppComparison' => '/api/analytics/app-comparison',
    'getSeverityDistribution' => '/api/analytics/severity-distribution'
];

foreach ($endpoints as $method => $uri) {
    echo "\n--------------------------------------------------\n";
    echo "Testing {$method} ({$uri})...\n";
    try {
        $req = Illuminate\Http\Request::create($uri, 'GET', ['range' => '7_days']);
        $req->setUserResolver(function () use ($admin) {
            return $admin; });

        $res = $controller->$method($req);

        echo "Status: " . $res->getStatusCode() . "\n";
        $data = $res->getData(true); // as array
        echo "Data Count: " . (is_array($data) ? count($data) : 'N/A') . "\n";
        if ($res->getStatusCode() !== 200) {
            echo "ERROR: Valid status code is 200.\n";
        }
    } catch (\Exception $e) {
        echo "EXCEPTION in {$method}: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n";
    }
}
