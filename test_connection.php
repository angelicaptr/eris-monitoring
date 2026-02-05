<?php

use Illuminate\Support\Facades\Mail;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    echo "Attempting to send email...\n";
    Mail::raw('Test connection content', function ($msg) {
        $msg->to('test@example.com')->subject('Connection Verification');
    });
    echo "EMAIL_SENT_SUCCESS\n";
} catch (\Exception $e) {
    file_put_contents(__DIR__ . '/email_debug.log', $e->getMessage() . "\n" . $e->getTraceAsString());
    echo "EMAIL_FAILED";
}
