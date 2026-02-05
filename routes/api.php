<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// User Step 2: API Route
Route::post('/logs', [LogController::class, 'store']);

// Dashboard API Routes
Route::middleware('web')->group(function () {

    // --- AREA ADMIN SAJA ---
    Route::middleware('role:admin')->group(function () {
        // CRUD Aplikasi (Admin Only)
        Route::post('/dashboard/apps', [\App\Http\Controllers\DashboardController::class, 'storeApp']);
        Route::put('/dashboard/apps/{id}', [\App\Http\Controllers\DashboardController::class, 'updateApp']);
        Route::delete('/dashboard/apps/{id}', [\App\Http\Controllers\DashboardController::class, 'deleteApp']);

        // Pusat Arsip (Admin Only)
        Route::get('/dashboard/archives', [\App\Http\Controllers\ArchiveController::class, 'index']);
        Route::get('/dashboard/archives/download/{id}/{type}', [\App\Http\Controllers\ArchiveController::class, 'download']);

        // Manajemen Users (Admin Only)
        Route::apiResource('/dashboard/users', \App\Http\Controllers\UserController::class);
        Route::get('/users/developers', [\App\Http\Controllers\UserController::class, 'getDevelopers']);

        // Global Settings (Admin Only)
        Route::get('/dashboard/settings', [\App\Http\Controllers\DashboardController::class, 'getSettings']);
        Route::put('/dashboard/settings', [\App\Http\Controllers\DashboardController::class, 'updateSettings']);
    });

    // --- AREA BERSAMA (Admin & Developer) ---
    Route::get('/dashboard/logs', [\App\Http\Controllers\DashboardController::class, 'getLogs']);
    Route::get('/dashboard/apps', [\App\Http\Controllers\DashboardController::class, 'getApps']); // Read-only list might be shared? assuming yes for context
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);

    // Profile Updates
    Route::put('/user/profile', [\App\Http\Controllers\AuthController::class, 'updateProfile']);
    Route::put('/user/password', [\App\Http\Controllers\AuthController::class, 'updatePassword']);

    // --- KHUSUS UPDATE STATUS (Developer Only) ---
    Route::patch('/dashboard/logs/{id}/status', [\App\Http\Controllers\DashboardController::class, 'updateLogStatus'])
        ->middleware('role:developer');
});



