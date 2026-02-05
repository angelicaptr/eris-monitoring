<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = \App\Models\Application::first()->api_key;

$request = \Illuminate\Http\Request::create('/api/logs', 'POST', [
    'api_key' => $apiKey,
    'message' => 'Fix verification: This message contains error but should be critical',
    'stack_trace' => 'Test stack trace',
    'severity' => 'critical'
]);

$controller = new \App\Http\Controllers\Api\LogController();

try {
    $response = $controller->store($request);
    $content = json_decode($response->getContent(), true);

    echo "Sent Severity: critical\n";
    echo "Message contains 'error' keyword\n";
    echo "Received Severity: " . $content['data']['severity'] . "\n";

    if ($content['data']['severity'] === 'critical') {
        echo "VERIFICATION SUCCESS: Severity was maintained as critical.\n";
        exit(0);
    } else {
        echo "VERIFICATION FAILED: Severity was changed to " . $content['data']['severity'] . "\n";
        exit(1);
    }

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
