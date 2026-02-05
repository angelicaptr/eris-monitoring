<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\ErrorLog;
use Illuminate\Support\Str;

class LogController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate API Key (The "Satpam")
        $apiKey = $request->header('X-API-KEY');

        if (!$apiKey) {
            $apiKey = $request->input('api_key');
        }

        $app = Application::where('api_key', $apiKey)->where('is_active', true)->first();

        if (!$app) {
            return response()->json(['message' => 'Unauthorized: Invalid or Inactive API Key'], 401);
        }

        // 2. Validate Input (Ditambahkan happened_at agar bisa manipulasi waktu)
        $validated = $request->validate([
            'message' => 'required|string',
            'stack_trace' => 'nullable|string',
            'severity' => 'nullable|in:error,warning,critical',
            'metadata' => 'nullable|array',
            'happened_at' => 'nullable|date', // Field untuk mesin waktu simulator
        ]);

        // 3. Auto-Severity (Regex Logic)
        if (!empty($validated['severity'])) {
            $severity = $validated['severity'];
        } else {
            $severity = 'error';

            $messageLower = strtolower($validated['message']);

            if (Str::contains($messageLower, ['timeout', 'fatal', 'deadlock', 'sql', 'memory', 'overflow', 'refused', 'panic'])) {
                $severity = 'critical';
            } else if (Str::contains($messageLower, ['error', 'fail', 'exception', 'undefined', 'null', 'syntax', 'unauthorized', 'invalid'])) {
                $severity = 'error';
            } else if (Str::contains($messageLower, ['deprecated', 'slow', 'retry', 'limit', 'expired'])) {
                $severity = 'warning';
            }
        }

        // 4. Save to Database (The "Brankas" with Time Travel)

        // Tentukan waktu: Pakai input happened_at jika ada, jika tidak pakai jam sekarang
        $timestamp = $request->input('happened_at') ?? now();

        $log = new ErrorLog([
            'application_id' => $app->id,
            'message' => $validated['message'],
            'stack_trace' => $validated['stack_trace'] ?? null,
            'severity' => $severity,
            'status' => 'open',
            'metadata' => array_merge($validated['metadata'] ?? [], [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'ingested_at' => now()->toIso8601String(), // Tetap catat waktu terima asli
            ]),
        ]);

        // Paksa Laravel menggunakan timestamp pilihan kita (Penting untuk grafik)
        $log->created_at = $timestamp;
        $log->save();

        // 5. Send Email Notification (Broadcast to Developers)
        try {
            if ($log->severity === 'critical') {
                // Check Master Switch
                $setting = \App\Models\GlobalSetting::where('key', 'email_notifications_enabled')->first();
                $isEmailEnabled = $setting ? filter_var($setting->value, FILTER_VALIDATE_BOOLEAN) : false;

                if ($isEmailEnabled) {
                    $developers = \App\Models\User::where('role', 'developer')->pluck('email');

                    if ($developers->isNotEmpty()) {
                        \Illuminate\Support\Facades\Mail::to($developers)->send(new \App\Mail\CriticalErrorNotification($log));
                    }
                }
            }
        } catch (\Exception $e) {
            // Silent fail for email to prevent API crash
            // Opsional: Log error pengiriman email ke file laravel.log
            \Illuminate\Support\Facades\Log::error("Failed to send critical error email: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Log recorded successfully',
            'data' => [
                'id' => $log->id,
                'status' => $log->status,
                'severity' => $log->severity,
                'created_at' => $log->created_at // Mengirim balik waktu yang tersimpan
            ]
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $log = ErrorLog::find($id);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved',
        ]);

        $status = $validated['status'];
        $user = $request->user();

        $updateData = [
            'status' => $status,
        ];

        if ($status === 'in_progress') {
            $updateData['in_progress_by'] = $user ? $user->id : null;
            $updateData['in_progress_at'] = now();
        } elseif ($status === 'resolved') {
            $updateData['resolved_by'] = $user ? $user->id : null;
            $updateData['resolved_at'] = now();
        }

        $log->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Status updated to ' . $status,
            'data' => $log
        ]);
    }
}