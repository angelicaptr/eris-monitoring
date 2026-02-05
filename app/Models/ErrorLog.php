<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErrorLog extends Model
{
    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
        'in_progress_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function inProgressBy()
    {
        return $this->belongsTo(User::class, 'in_progress_by');
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
