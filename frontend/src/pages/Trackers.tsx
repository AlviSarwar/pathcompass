import Tracker from '../components/Tracker'

export function Projects() {
  return (
    <Tracker title="Project portfolio" endpoint="/projects/" statusKey="status"
      empty="No projects yet. Add your GitHub projects here so you always know what to show recruiters."
      fields={[
        { key: 'name', label: 'Project name', required: true },
        { key: 'github_url', label: 'GitHub link', type: 'url' },
        { key: 'status', label: 'Status', type: 'select', options: ['idea', 'building', 'done', 'archived'] },
        { key: 'tech_stack', label: 'Tech stack (comma separated)' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]} />
  )
}

export function Applications() {
  return (
    <Tracker title="Internship and job applications" endpoint="/applications/" statusKey="status"
      empty="No applications yet."
      fields={[
        { key: 'company', label: 'Company', required: true },
        { key: 'role', label: 'Role', required: true },
        { key: 'applied_date', label: 'Date applied', type: 'date' },
        { key: 'deadline', label: 'Deadline', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['wishlist', 'applied', 'interview', 'offer', 'rejected', 'withdrawn'] },
        { key: 'link', label: 'Posting link', type: 'url' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]} />
  )
}

export function Scholarships() {
  return (
    <Tracker title="Scholarship tracker" endpoint="/scholarships/" statusKey="status"
      empty="No scholarships yet. Always confirm deadlines and requirements on the official page."
      fields={[
        { key: 'name', label: 'Scholarship', required: true },
        { key: 'deadline', label: 'Deadline', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['researching', 'preparing', 'applied', 'awarded', 'rejected'] },
        { key: 'link', label: 'Official link', type: 'url' },
        { key: 'requirements', label: 'Requirements', type: 'textarea' },
      ]} />
  )
}

export function TestScores() {
  return (
    <Tracker title="IELTS / TOEFL / GRE score tracker" endpoint="/test-scores/" statusKey="kind"
      empty="No scores yet. Log every mock test to see your trend. Use total scores: IELTS 0-9 (steps of 0.5), TOEFL 0-120, GRE 260-340."
      fields={[
        { key: 'exam', label: 'Exam', type: 'select', options: ['ielts', 'toefl', 'gre'] },
        { key: 'kind', label: 'Type', type: 'select', options: ['mock', 'official'] },
        { key: 'test_date', label: 'Test date', type: 'date' },
        { key: 'score', label: 'Total score', required: true },
        { key: 'notes', label: 'Notes (weak sections, etc.)', type: 'textarea' },
      ]} />
  )
}
