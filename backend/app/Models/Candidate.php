<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $fillable = ['name'];

    public function exams()
    {
        return $this->belongsToMany(Exam::class, 'exam_candidates');
    }
}
