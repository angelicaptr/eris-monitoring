<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;

Route::get('/{any?}', [DashboardController::class, 'index'])
    ->where('any', '^(?!api|sanctum|storage|_debugbar).*$') // Exclude API and asset routes
    ->name('dashboard');

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/me', [AuthController::class, 'me']);
Route::put('/user/password', [AuthController::class, 'updatePassword']);
Route::put('/user/profile', [AuthController::class, 'updateProfile']);
Route::post('/user/photo-upload', [AuthController::class, 'uploadPhoto']);

// Debug route
Route::get('/debug-auth', function () {
    return response()->json([
        'check' => auth()->check(),
        'user' => auth()->user(),
        'session_id' => session()->getId(),
    ]);
});