<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $table = 'exams';  

    protected $fillable = [
        'title',
        'status',
        'datetime',
        'language',
        'country',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'datetime' => 'datetime',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function candidates()
    {
        return $this->belongsToMany(Candidate::class, 'exam_candidates');
    }
}
