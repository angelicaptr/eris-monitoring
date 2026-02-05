<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    use HasFactory;

    protected $fillable = [
        'periode',
        'year',
        'pdf_path',
        'excel_path',
        'generated_at',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
    ];
}
