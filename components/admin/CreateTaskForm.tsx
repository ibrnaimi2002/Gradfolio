'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MAJORS_BY_FIELD: Record<string, string[]> = {
  IT: ['Cybersecurity', 'Data Analysis', 'Software Development'],
  Business: ['Marketing', 'Finance'],
  Design: ['Graphic Design', 'UI/UX'],
}

interface InitialValues {
  title?: string
  description?: string
  field?: string
  major?: string
  skills?: string[]
  submission_type?: string
  deadline?: string | null
}

interface Props {
  action: (formData: FormData) => Promise<{ error?: string }>
  initialValues?: InitialValues
  submitLabel?: string
  redirectTo?: string
}

export default function CreateTaskForm({
  action,
  initialValues,
  submitLabel = 'Create Task',
  redirectTo = '/tasks',
}: Props) {
  const router = useRouter()
  const [field, setField] = useState(initialValues?.field ?? '')
  const [major, setMajor] = useState(initialValues?.major ?? '')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const majors = MAJORS_BY_FIELD[field] ?? []

  const initialSkills = initialValues?.skills?.join(', ') ?? ''
  const initialDeadline = initialValues?.deadline
    ? initialValues.deadline.split('T')[0]
    : ''

  function validate(data: FormData): Record<string, string> {
    const e: Record<string, string> = {}
    if (!(data.get('title') as string).trim()) e.title = 'Required'
    if (!(data.get('description') as string).trim()) e.description = 'Required'
    if (!field) e.field = 'Required'
    if (!major) e.major = 'Required'
    if (!(data.get('submission_type') as string)) e.submission_type = 'Required'
    return e
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    form.set('field', field)
    form.set('major', major)

    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    setServerError('')
    setLoading(true)

    try {
      const result = await action(form)
      if (result?.error) {
        setServerError(result.error)
      } else {
        router.push(redirectTo)
      }
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          defaultValue={initialValues?.title ?? ''}
          placeholder="e.g. Build a REST API with authentication"
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
            errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          rows={6}
          defaultValue={initialValues?.description ?? ''}
          placeholder="Describe the task in detail — what to build, constraints, expected output..."
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      {/* Field + Major */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Field <span className="text-red-500">*</span>
          </label>
          <select
            value={field}
            onChange={(e) => { setField(e.target.value); setMajor('') }}
            className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.field ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select field</option>
            <option value="IT">IT</option>
            <option value="Business">Business</option>
            <option value="Design">Design</option>
          </select>
          {errors.field && <p className="text-xs text-red-500 mt-1">{errors.field}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Major <span className="text-red-500">*</span>
          </label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            disabled={!field}
            className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
              errors.major ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">{field ? 'Select major' : 'Select field first'}</option>
            {majors.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.major && <p className="text-xs text-red-500 mt-1">{errors.major}</p>}
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Skills{' '}
          <span className="text-xs text-gray-400 font-normal">comma separated, optional</span>
        </label>
        <input
          name="skills"
          type="text"
          defaultValue={initialSkills}
          placeholder="e.g. Python, REST APIs, JWT"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Submission Type + Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Submission Type <span className="text-red-500">*</span>
          </label>
          <select
            name="submission_type"
            defaultValue={initialValues?.submission_type ?? ''}
            className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
              errors.submission_type ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select type</option>
            <option value="text">Text</option>
            <option value="link">Link</option>
            <option value="file">File</option>
          </select>
          {errors.submission_type && (
            <p className="text-xs text-red-500 mt-1">{errors.submission_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Deadline{' '}
            <span className="text-xs text-gray-400 font-normal">optional</span>
          </label>
          <input
            name="deadline"
            type="date"
            defaultValue={initialDeadline}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
