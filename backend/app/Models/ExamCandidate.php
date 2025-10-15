<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamCandidate extends Model
{
    protected $table = 'exam_candidates';
    protected $fillable = ['exam_id', 'candidate_id'];
}
