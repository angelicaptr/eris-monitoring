<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = new \App\Http\Controllers\UserController();
    $response = $controller->getDevelopers();
    echo "SUCCESS: " . json_encode($response->getData());
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
