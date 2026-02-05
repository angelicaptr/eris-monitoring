<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function index()
    {
        return response()->json(Application::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notification_email' => 'nullable|email',
        ]);

        $app = Application::create([
            'app_name' => $validated['app_name'],
            'description' => $validated['description'],
            'notification_email' => $validated['notification_email'],
            'api_key' => Str::random(32),
            'is_active' => true,
            'user_id' => Auth::id(),
        ]);

        return response()->json($app, 201);
    }

    public function toggleStatus($id)
    {
        $app = Application::findOrFail($id);
        $app->is_active = !$app->is_active;
        $app->save();

        return response()->json($app);
    }

    public function update(Request $request, $id)
    {
        $app = Application::findOrFail($id);

        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notification_email' => 'nullable|email',
        ]);

        $app->update($validated);

        return response()->json($app);
    }

    public function destroy($id)
    {
        $app = Application::findOrFail($id);
        $app->delete();

        return response()->json(['message' => 'Application deleted']);
    }
}
