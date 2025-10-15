<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;

class ExamController extends Controller
{
    /**
     * Return the exam collection with optional filters applied.
     * The frontend expects candidates preloaded so we eager-load them here.
     */
    public function index(Request $request)
    {
        $query = Exam::query();

   // ✅ Load candidates relationship
   $query = Exam::with('candidates');

        // Basic filters the` UI needs
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('country')) {
            $query->where('country', $request->string('country'));
        }

        if ($request->filled('language')) {
            $query->where('language', $request->string('language'));
        }

        if ($request->filled('date')) {
            // expects YYYY-MM-DD from the UI
            $query->whereDate('datetime', $request->date('date'));
        }

        // OPTIONAL: if you added Candidate + pivot models and want name filter
        if ($request->filled('candidate')) {
            $name = $request->string('candidate');
            // use this if relationships exist:
            $query->whereHas('candidates', fn ($q) => $q->where('name', 'like', "%{$name}%"));
            // if you do NOT have relationships and stored candidates as JSON on the exam row, use:
            // $query->whereJsonContains('candidates', $name);
        }

        return $query->orderBy('datetime', 'asc')->get();
    }

    /**
     * Advance (or directly set) the status of a single exam.
     */
    public function updateStatus(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        // If a specific status was sent, set it. Otherwise auto-advance.
        if ($request->filled('status')) {
            $new = (string) $request->string('status');
        } else {
            switch ($exam->status) {
                case 'Pending':
                    $new = 'Started';
                    break;

                case 'Started':
                    $new = 'Finished';
                    break;

                default:
                    $new = 'Finished';
                    break;
            }
        }

        $exam->status = $new;
        $exam->save();

        return response()->json([
            'id' => $exam->id,
            'status' => $exam->status,
            'message' => 'Exam status updated.',
        ]);
    }
}
