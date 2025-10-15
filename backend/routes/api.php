<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExamController;

Route::get('/exams', [ExamController::class, 'index']);
Route::put('/exams/{id}/status', [ExamController::class, 'updateStatus']);
