<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $guarded = [];

    public function errorLogs()
    {
        return $this->hasMany(ErrorLog::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function developers()
    {
        return $this->belongsToMany(User::class, 'application_user');
    }
}
