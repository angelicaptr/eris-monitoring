<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Archive;
use Illuminate\Support\Facades\Storage;

class ArchiveController extends Controller
{
    public function index()
    {
        return response()->json(Archive::latest('generated_at')->get());
    }

    public function download($id, $type)
    {
        $archive = Archive::findOrFail($id);

        $path = '';
        if ($type === 'pdf') {
            $path = $archive->pdf_path;
        } elseif ($type === 'excel') {
            $path = $archive->excel_path;
        } else {
            abort(404);
        }

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($path);
    }
}
