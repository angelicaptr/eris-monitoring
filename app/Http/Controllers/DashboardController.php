<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Application;
use App\Models\ErrorLog;

class DashboardController extends Controller
{
    public function index()
    {
        // Mengambil data nyata dari database yang barusan kamu buat
        $stats = [
            'total_errors' => ErrorLog::count(),
            'critical_errors' => ErrorLog::where('severity', 'critical')->count(),
            'resolved_today' => ErrorLog::where('status', 'resolved')->whereDate('updated_at', now())->count(),
            'active_apps' => Application::count()
        ];

        $trendData = collect([]); // Kosong dulu karena belum ada data harian
        $severityData = collect([]); // Kosong dulu
        $recentErrors = ErrorLog::with('application')->latest()->limit(5)->get();

        return view('dashboard.index', compact('stats', 'trendData', 'severityData', 'recentErrors'));
    }
    public function updateLogStatus(Request $request, $id)
    {
        $log = ErrorLog::findOrFail($id);
        $status = $request->input('status');
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
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

        return response()->json(['message' => 'Status updated', 'log' => $log->load('inProgressBy', 'resolvedBy', 'application')]);

    }


    public function getLogs()
    {
        $logs = ErrorLog::with(['application', 'inProgressBy', 'resolvedBy'])->orderBy('created_at', 'desc')->get();
        return response()->json($logs);
    }

    public function getApps()
    {
        $apps = Application::all();
        return response()->json($apps);
    }

    public function storeApp(Request $request)
    {
        $request->validate([
            'app_name' => 'required|string|max:255',
            'notification_email' => 'nullable|email',
        ]);

        $app = Application::create([
            'app_name' => $request->app_name,
            'description' => $request->description,
            'notification_email' => $request->notification_email,
            'api_key' => \Illuminate\Support\Str::random(32),
            'is_active' => true,
            'user_id' => $request->user() ? $request->user()->id : null,
        ]);

        return response()->json($app, 201);
    }

    public function updateApp(Request $request, $id)
    {
        $app = Application::findOrFail($id);

        $request->validate([
            'app_name' => 'required|string|max:255',
            'notification_email' => 'nullable|email',
        ]);

        $app->update([
            'app_name' => $request->app_name,
            'description' => $request->description,
            'notification_email' => $request->notification_email,
        ]);

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
}