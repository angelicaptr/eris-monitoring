<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// Run the archive process on the first day of every quarter (Jan, Apr, Jul, Oct) at 00:00
Schedule::command('logs:archive')->quarterly()->timezone('Asia/Jakarta');
