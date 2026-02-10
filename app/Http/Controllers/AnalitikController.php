<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ErrorLog;
use App\Models\Application;
use Illuminate\Support\Facades\DB;

class AnalitikController extends Controller
{
    /**
     * Get aggregated summary stats
     */
    public function getSummary(Request $request)
    {
        $user = $request->user();
        $range = $request->input('range', '7_days'); // 7_days, 30_days, all_time

        $logQuery = ErrorLog::query();

        // 1. Role Filtering
        if ($user->role === 'developer') {
            $appIds = $user->applications()->pluck('applications.id');
            $logQuery->whereIn('error_logs.application_id', $appIds);
        }

        // 2. Date Filtering
        // We use explicit table name 'error_logs' to avoid ambiguity if we clone and join later.
        if ($range === '7_days') {
            $logQuery->where('error_logs.created_at', '>=', now()->subDays(7));
        } elseif ($range === '30_days') {
            $logQuery->where('error_logs.created_at', '>=', now()->subDays(30));
        }

        // 3. Clone queries for specific counts to avoid resetting state
        $totalErrors = (clone $logQuery)->count();
        $resolvedCount = (clone $logQuery)->where('status', 'resolved')->count();
        $pendingCount = (clone $logQuery)->where('status', '!=', 'resolved')->count();
        $criticalCount = (clone $logQuery)->where('severity', 'critical')->count();

        // 4. Calculate Average Resolution Time (in Hours)
        // Logic: Avg of (resolved_at - created_at) for resolved logs only
        $avgResolutionTime = 0;

        // We use a raw DB query for efficiency on large datasets
        // Note: TIMESTAMPDIFF(HOUR, created_at, resolved_at) in MySQL
        $avgQuery = (clone $logQuery)->where('status', 'resolved');

        // Apply same app filters if dev
        if ($user->role === 'developer') {
            // Query builder already has the whereIn from step 1? No, we cloned from base. 
            // Actually, step 1 modified $logQuery strictly. Yes.
        }

        $avgMinutes = $avgQuery->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, error_logs.created_at, resolved_at)) as avg_min')
            ->value('avg_min');

        if ($avgMinutes) {
            $avgHours = round($avgMinutes / 60, 1);
            $avgResolutionTime = $avgHours;
        }

        // 5. Trend Data (Daily count for the range)
        // Group by Date (Adjusted for +07:00 timezone)
        $trendQuery = (clone $logQuery)
            ->selectRaw('DATE(DATE_ADD(error_logs.created_at, INTERVAL 7 HOUR)) as date, COUNT(*) as count')
            ->groupBy(DB::raw('DATE(DATE_ADD(error_logs.created_at, INTERVAL 7 HOUR))'))
            ->orderBy('date', 'asc');

        $trendData = $trendQuery->get();

        return response()->json([
            'total_errors' => $totalErrors,
            'resolved' => $resolvedCount,
            'pending' => $pendingCount,
            'critical' => $criticalCount,
            'avg_resolution_time' => $avgResolutionTime, // in hours
            'trend' => $trendData
        ]);
    }

    /**
     * Get Top Errors ranking
     */
    public function getTopErrors(Request $request)
    {
        $user = $request->user();
        $range = $request->input('range', '7_days');

        $baseQuery = ErrorLog::query();

        // Role Filter
        if ($user->role === 'developer') {
            $appIds = $user->applications()->pluck('applications.id');
            $baseQuery->whereIn('error_logs.application_id', $appIds);
        }

        // Date Filter
        // Explicit table name to avoid ambiguity when joining applications (which also has created_at)
        if ($range === '7_days') {
            $baseQuery->where('error_logs.created_at', '>=', now()->subDays(7));
        } elseif ($range === '30_days') {
            $baseQuery->where('error_logs.created_at', '>=', now()->subDays(30));
        }

        if ($user->role === 'admin') {
            // Admin: Top 5 Applications by Error Volume
            $topData = (clone $baseQuery)
                ->join('applications', 'error_logs.application_id', '=', 'applications.id')
                ->selectRaw('applications.app_name as label, COUNT(*) as value')
                ->groupBy('applications.app_name')
                ->orderByDesc('value')
                ->limit(5)
                ->get();
        } else {
            // Developer: Top 5 Error Messages
            // Cast or substring message for grouping to avoid strict SQL errors with TEXT
            $topData = (clone $baseQuery)
                ->selectRaw('LEFT(message, 50) as label, COUNT(*) as value')
                ->groupBy(DB::raw('LEFT(message, 50)'))
                ->orderByDesc('value')
                ->limit(5)
                ->get();
        }

        return response()->json($topData);
    }

    /**
     * Get Comparison Data (Errors per App) - Useful for Devs with multiple apps
     */
    public function getAppComparison(Request $request)
    {
        $user = $request->user();
        $range = $request->input('range', '7_days');

        if ($user->role === 'admin') {
            // Admin: Developer Productivity (Resolved Errors per Developer)
            $query = ErrorLog::query()
                ->join('users', 'error_logs.resolved_by', '=', 'users.id')
                ->selectRaw('users.name as label, COUNT(*) as value')
                ->where('error_logs.status', 'resolved');

            // Date Filter
            if ($range === '7_days') {
                $query->where('error_logs.created_at', '>=', now()->subDays(7));
            } elseif ($range === '30_days') {
                $query->where('error_logs.created_at', '>=', now()->subDays(30));
            }

            $data = $query->groupBy('users.name')
                ->orderByDesc('value')
                ->get();
        } else {
            // Developer: Errors per App (Original Logic)
            $query = ErrorLog::query()
                ->join('applications', 'error_logs.application_id', '=', 'applications.id')
                ->selectRaw('applications.app_name as label, COUNT(*) as value');

            // Role Filter
            $appIds = $user->applications()->pluck('applications.id');
            $query->whereIn('error_logs.application_id', $appIds);

            // Date Filter
            if ($range === '7_days') {
                $query->where('error_logs.created_at', '>=', now()->subDays(7));
            } elseif ($range === '30_days') {
                $query->where('error_logs.created_at', '>=', now()->subDays(30));
            }

            $data = $query->groupBy('applications.app_name')
                ->orderByDesc('value')
                ->get();
        }

        return response()->json($data);
    }

    /**
     * Get Severity Distribution - Creative addition
     */
    public function getSeverityDistribution(Request $request)
    {
        $user = $request->user();
        $range = $request->input('range', '7_days');

        $query = ErrorLog::query()->selectRaw('severity as label, COUNT(*) as value');

        // Role Filter
        if ($user->role === 'developer') {
            $appIds = $user->applications()->pluck('applications.id');
            $query->whereIn('application_id', $appIds);
        }

        // Date Filter
        if ($range === '7_days') {
            $query->where('error_logs.created_at', '>=', now()->subDays(7));
        } elseif ($range === '30_days') {
            $query->where('error_logs.created_at', '>=', now()->subDays(30));
        }

        $data = $query->groupBy('severity')->get();

        return response()->json($data);
    }
}
