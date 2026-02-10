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

try {
    $req = Illuminate\Http\Request::create('/api/analytics/top-errors', 'GET', ['range' => '7_days']);
    $req->setUserResolver(function () use ($admin) {
        return $admin; });

    $controller = app()->make(\App\Http\Controllers\AnalitikController::class);
    $res = $controller->getTopErrors($req);

    echo "Status: " . $res->getStatusCode() . "\n";
    echo "Data: " . json_encode($res->getData()) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
