<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Application;
use App\Models\ErrorLog;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return view('dashboard.index');
        }

        $appQuery = Application::query();
        $logQuery = ErrorLog::query();

        if ($user->role === 'developer') {
            // Filter apps assigned to this developer
            $appIds = $user->applications()->pluck('applications.id');
            $appQuery->whereIn('id', $appIds);
            $logQuery->whereIn('application_id', $appIds);
        }

        $stats = [
            'total_errors' => $logQuery->count(),
            'critical_errors' => (clone $logQuery)->where('severity', 'critical')->count(),
            'resolved_today' => (clone $logQuery)->where('status', 'resolved')->whereDate('updated_at', now())->count(),
            'active_apps' => $appQuery->count()
        ];

        $trendData = collect([]);
        $severityData = collect([]);
        // Recent errors also filtered
        $recentErrors = (clone $logQuery)->with('application')->latest()->limit(5)->get();

        return view('dashboard.index', compact('stats', 'trendData', 'severityData', 'recentErrors'));
    }
    public function updateLogStatus(Request $request, $id)
    {
        $log = ErrorLog::with(['inProgressUser', 'resolvedUser'])->findOrFail($id);
        $status = $request->input('status');
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // --- Access Control Logic ---
        if ($status === 'open') {
            if ($user->role === 'developer') {
                if (
                    ($log->in_progress_by && $log->in_progress_by !== $user->id) ||
                    ($log->resolved_by && $log->resolved_by !== $user->id)
                ) {
                    return response()->json(['message' => 'This log is currently being worked on by someone else.'], 403);
                }
            }
            // Admin allowed.
        } else {
            // in_progress or resolved
            if (
                ($log->in_progress_by && $log->in_progress_by !== $user->id) ||
                ($log->resolved_by && $log->resolved_by !== $user->id)
            ) {
                $claimer = $log->inProgressUser ?? $log->resolvedUser;
                $claimerName = $claimer ? $claimer->name : 'Unknown';
                return response()->json(['message' => 'Claimed/Worked on by ' . $claimerName], 403);
            }
        }

        if ($status === 'in_progress') {
            $log->update([
                'status' => 'in_progress',
                'in_progress_by' => $user->id,
                'in_progress_at' => now(),
                'resolved_at' => null,
                'resolved_by' => null,
            ]);
        } elseif ($status === 'resolved') {
            $log->update([
                'status' => 'resolved',
                'resolved_by' => $user->id,
                'resolved_at' => now(),
            ]);
        } elseif ($status === 'open') {
            $log->update([
                'status' => 'open',
                'in_progress_by' => null,
                'in_progress_at' => null,
                'resolved_by' => null,
                'resolved_at' => null,
            ]);
        }

        return response()->json(['message' => 'Status updated', 'log' => $log->load('inProgressUser', 'resolvedUser', 'application')]);
    }


    public function getLogs(Request $request)
    {
        $query = ErrorLog::with(['application', 'inProgressUser', 'resolvedUser'])->orderBy('created_at', 'desc');

        if ($request->user()->role === 'developer') {
            $appIds = $request->user()->applications()->pluck('applications.id');
            $query->whereIn('application_id', $appIds);
        }

        if ($request->has('limit')) {
            $query->limit($request->input('limit'));
        }

        $logs = $query->get();
        return response()->json($logs);
    }

    public function getApps(Request $request)
    {
        $query = Application::with('developers');

        if ($request->user()->role === 'developer') {
            $query->whereHas('developers', function ($q) use ($request) {
                $q->where('users.id', $request->user()->id);
            });
        }

        $apps = $query->get();
        return response()->json($apps);
    }

    public function storeApp(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
        ]);

        $app = Application::create([
            'app_name' => $request->app_name,
            'description' => $request->description,
            'api_key' => \Illuminate\Support\Str::random(32),
            'is_active' => true,
            'user_id' => $request->user() ? $request->user()->id : null,
        ]);

        if ($request->has('developers')) {
            $app->developers()->sync($request->developers);
        }

        return response()->json($app, 201);
    }

    public function updateApp(Request $request, $id)
    {
        $app = Application::findOrFail($id);

        $request->validate([
            'app_name' => 'required|string|max:255',
        ]);

        $app->update([
            'app_name' => $request->app_name,
            'description' => $request->description,
        ]);

        if ($request->has('developers')) {
            $app->developers()->sync($request->developers);
        }

        return response()->json($app);
    }

    public function deleteApp($id)
    {
        $app = Application::findOrFail($id);
        $app->delete();
        return response()->json(['message' => 'Application deleted']);
    }

    public function getSettings()
    {
        $settings = \App\Models\GlobalSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'email_notifications_enabled' => 'required|boolean',
        ]);

        \App\Models\GlobalSetting::updateOrCreate(
            ['key' => 'email_notifications_enabled'],
            ['value' => $data['email_notifications_enabled'] ? 'true' : 'false']
        );

        return response()->json(['message' => 'Settings updated']);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:error_logs,id',
            'status' => 'required|in:open,in_progress,resolved',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $status = $request->status;

        // --- Access Control Logic ---
        $logs = ErrorLog::whereIn('id', $request->ids)->get();
        foreach ($logs as $log) {
            // Admin can always force 'open', but if setting to in_progress/resolved, must respect existing claims?
            // Requirement: "admin punya akses untuk balikin log itu kembali ke open (tapi tetap gapunya akses untuk resolved/inprogress)"
            // So Admin acts like Developer for 'in_progress' and 'resolved', but has superpower for 'open'.

            if ($status === 'open') {
                if ($user->role !== 'admin' && $user->role !== 'developer') { // Should not happen if middleware is set, but just in case
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                // Developer can only return to open if they own it? Or if it's their app?
                // Usually developer can un-claim their own task.
                if ($user->role === 'developer') {
                    // If claimed by someone else, Dev cannot unclaim it.
                    if (
                        ($log->in_progress_by && $log->in_progress_by !== $user->id) ||
                        ($log->resolved_by && $log->resolved_by !== $user->id)
                    ) {
                        $log->load(['inProgressUser', 'resolvedUser']);
                        $claimer = $log->inProgressUser ?? $log->resolvedUser;
                        $claimerName = $claimer ? $claimer->name : 'User Lain';
                        return response()->json(['message' => "Failed: Log #{$log->id} is being worked on by {$claimerName}."], 403);
                    }
                }
                // Admin can always set to open.
            } else {
                // Status is 'in_progress' or 'resolved'
                // Check if already claimed by someone else
                if (
                    ($log->in_progress_by && $log->in_progress_by !== $user->id) ||
                    ($log->resolved_by && $log->resolved_by !== $user->id)
                ) {
                    $claimer = $log->inProgressUser ?? $log->resolvedUser;
                    $claimerName = $claimer ? $claimer->name : 'Unknown';
                    return response()->json(['message' => 'Log is being worked on/claimed by ' . $claimerName], 403);
                }
            }
        }

        $updateData = ['status' => $status];

        if ($status === 'in_progress') {
            $updateData['in_progress_by'] = $user->id;
            $updateData['in_progress_at'] = now();
            // Clear resolved if moving back to in_progress? Yes.
            $updateData['resolved_at'] = null;
            $updateData['resolved_by'] = null;
        } elseif ($status === 'resolved') {
            $updateData['resolved_by'] = $user->id;
            $updateData['resolved_at'] = now();
            // Keep in_progress info? Usually yes, to know who started it. 
            // But if resolved_by is different from in_progress_by? 
            // The logic above ensures only the claimer can resolve.
            // But wait, if 'open' -> 'resolved' directly? 
            // Then in_progress is null.
        } elseif ($status === 'open') {
            $updateData['in_progress_by'] = null;
            $updateData['in_progress_at'] = null;
            $updateData['resolved_by'] = null;
            $updateData['resolved_at'] = null;
        }

        ErrorLog::whereIn('id', $request->ids)->update($updateData);

        return response()->json(['message' => 'Bulk status updated']);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:error_logs,id',
        ]);

        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ErrorLog::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Bulk delete successful']);
    }
}