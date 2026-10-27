export interface SemesterRow { id: number; name: string; order: number; gpa: number | null; credits: number; cgpa: number | null }

export interface DashboardData {
  cgpa: number | null
  target_cgpa: number
  max_point: number
  credits_attempted: number
  credits_earned: number
  credits_remaining: number
  total_credits_required: number
  completed_semesters: number
  best_semester: { name: string; gpa: number } | null
  lowest_semester: { name: string; gpa: number } | null
  semesters: SemesterRow[]
  grade_distribution: Record<string, number>
  warnings: string[]
  explanation: string
}

export interface TargetResult {
  target_cgpa: number
  current_cgpa: number | null
  remaining_credits: number
  required_avg_gpa: number | null
  achievable: boolean
  already_secured: boolean
  highest_final_cgpa: number | null
  lowest_final_cgpa: number | null
  max_grade_point: number
  scenarios: { future_gpa: number; final_cgpa: number; meets_target: boolean }[]
  message: string
}

export interface Semester { id: number; name: string; order: number; is_planned: boolean }
export interface Course {
  id: number; semester: number; code: string; title: string; credits: string
  letter_grade: string; grade_point: string | null; status: string
}
export interface Boundary { letter: string; point: string; is_pass: boolean }
export interface Scale { id: number; name: string; max_point: number; boundaries: Boundary[] }

export interface Profile {
  university: string; department: string; degree_name: string
  total_credits_required: string; target_cgpa: string
  retake_policy: string; rounding_places: string; career_track: string
  probation_cgpa: string; deans_list_cgpa: string; max_credits_per_semester: string
}


export interface SafeZone {
  cgpa: number | null; probation_cgpa: number; deans_list_cgpa: number; max_point: number
  status: 'no_data' | 'probation' | 'warning' | 'safe' | 'deans_list'
  message: string; margin_to_probation: number | null; gap_to_deans: number | null
}
export interface RetakeRow { code: string; credits: number; current_letter: string; current_point: number; new_cgpa: number; gain: number }
export interface RetakeImpact { base_cgpa: number | null; grade_point: number; policy: string; items: RetakeRow[] }
export interface CreditPlan {
  max_per_semester: number; remaining_credits: number; min_semesters_needed: number
  semesters: { id: number; name: string; order: number; is_planned: boolean; credits: number; status: string; message: string }[]
}
export interface Skill { id: number; name: string; level: number; target_level: number; notes: string }
