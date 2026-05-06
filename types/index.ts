export interface Profile {
  id: string
  field: string
  major: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  field: string
  major: string
  skills: string[]
  submission_type: 'file' | 'link' | 'text'
  deadline: string
  created_at: string
}

export interface Submission {
  id: string
  user_id: string
  task_id: string
  content: string
  status: 'submitted' | 'under_review' | 'reviewed'
  created_at: string
  task?: Task
  review?: Review
}

export interface Review {
  id: string
  submission_id: string
  score: number
  feedback: string
  reviewed_by: string
  reviewed_at: string
}

export interface AdminSubmission extends Submission {
  profile?: Profile
  task?: Task
  review?: Review
}
