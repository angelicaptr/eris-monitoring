<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ErrorLog;
use App\Models\Archive;
use Illuminate\Support\Facades\Storage;
// Assuming these facades will be available once packages are installed
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ArchiveLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:archive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Archive old logs and purge them from the main database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting log archival process...');

        // 1. Determine Periode strategy
        // This task is scheduled for Jan 1, Apr 1, Jul 1, Oct 1
        // It archives the PREVIOUS quarter.
        $now = Carbon::now();
        $previousQuarterDate = $now->copy()->subMonths(3);

        $year = $previousQuarterDate->year;
        $quarter = $previousQuarterDate->quarter;
        $periode = "Triwulan " . $this->roman($quarter) . " " . $year;

        $this->info("Target Period: $periode");

        // 2. Query Logs older than 3 months
        // Logic: if running on April 1st (Q2 start), we archive Q1 (Jan-Mar).
        // Anything before April 1st 00:00:00.
        $cutoffDate = $now->startOfQuarter();

        // Strict boundary check as requested: "31 Maret masuk arsip, 1 April tetap"
        $logsToArchive = ErrorLog::where('created_at', '<', $cutoffDate)->get();

        if ($logsToArchive->isEmpty()) {
            $this->info('No logs found to archive.');
            return;
        }

        $this->info("Found " . $logsToArchive->count() . " logs to archive.");

        // 3. Generate Files
        // CSV (Compatible with Excel)
        $excelFilename = "ERIS_RawLogs_" . $year . "_Q" . $quarter . ".csv";

        // Generate CSV Content
        // Corrected Mappings: Remove Error Code (doesn't exist), Map Service -> App Name, User -> Resolved By, Timestamp -> created_at
        $csvHeader = ["ID", "Severity", "Service/Application", "Message", "Resolved By", "Timestamp"];
        $csvRows = [];
        $csvRows[] = implode(",", $csvHeader);

        foreach ($logsToArchive as $log) {
            // Eager load relationships if possible, but for now lazy accessing is okay for small batches
            $appName = $log->application ? $log->application->app_name : 'Unknown';
            $resolverName = $log->resolvedBy ? $log->resolvedBy->name : '-'; // Assuming resolvedBy relation exists and returns User

            $csvRows[] = implode(",", [
                $log->id,
                $log->severity,
                $appName,
                '"' . str_replace('"', '""', $log->message) . '"', // Escape quotes
                $resolverName,
                $log->created_at // Changed from timestamp (which doesn't exist) to created_at
            ]);
        }
        $csvContent = implode("\n", $csvRows);

        // Save CSV to Storage
        Storage::disk('public')->put('archives/' . $excelFilename, $csvContent);


        // PDF (Keep simulated for now as user removed it from frontend, but we keep backend logic safe)
        $pdfFilename = "ERIS_Analytics_" . $year . "_Q" . $quarter . ".pdf";
        Storage::disk('public')->put('archives/' . $pdfFilename, 'PDF generation pending implementation.');

        // 4. Save to Archives Table
        Archive::create([
            'periode' => $periode,
            'year' => $year,
            'pdf_path' => 'archives/' . $pdfFilename,
            'excel_path' => 'archives/' . $excelFilename, // Storing .csv path in excel_path column
            'generated_at' => now(),
        ]);

        // 5. Purge
        ErrorLog::where('created_at', '<', $cutoffDate)->delete();

        $this->info('Archival and purge process completed successfully.');
    }

    private function roman($number)
    {
        $map = array('M' => 1000, 'CM' => 900, 'D' => 500, 'CD' => 400, 'C' => 100, 'XC' => 90, 'L' => 50, 'XL' => 40, 'X' => 10, 'IX' => 9, 'V' => 5, 'IV' => 4, 'I' => 1);
        $returnValue = '';
        while ($number > 0) {
            foreach ($map as $roman => $int) {
                if ($number >= $int) {
                    $number -= $int;
                    $returnValue .= $roman;
                    break;
                }
            }
        }
        return $returnValue;
    }
}
