'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast from './Toast'
import { Task } from '@/types'

interface SubmissionFormProps {
  task: Task
  userId: string
}

function extractMessage(err: unknown): string {
  if (!err) return 'Unknown error'
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message)
  return String(err)
}

export default function SubmissionForm({ task, userId }: SubmissionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setToast({ message: 'Your session has expired. Please sign in again.', type: 'error' })
        setTimeout(() => router.push('/login'), 1500)
        return
      }

      let finalContent = content

      if (task.submission_type === 'file') {
        if (!file) {
          setToast({ message: 'Please select a file to upload.', type: 'error' })
          return
        }

        const ext = file.name.split('.').pop()
        const filePath = `${userId}/${task.id}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(filePath)
        finalContent = urlData.publicUrl
      }

      if (!finalContent.trim()) {
        setToast({ message: 'Please provide a submission before submitting.', type: 'error' })
        return
      }

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({ user_id: userId, task_id: task.id, content: finalContent.trim(), status: 'submitted' })
        .select()
        .single()

      if (insertError) throw insertError

      setToast({ message: 'Submission sent! Redirecting to dashboard…', type: 'success' })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: unknown) {
      setToast({ message: extractMessage(err), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {task.submission_type === 'text' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={9}
              placeholder="Write your solution here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-all"
              required
            />
            <p className="text-xs text-gray-400 mt-1.5">
              {content.length} characters · Be thorough and clear
            </p>
          </div>
        )}

        {task.submission_type === 'link' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link to your work
            </label>
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              required
            />
            <p className="text-xs text-gray-400 mt-1.5">
              GitHub repo, Figma file, Google Docs, Notion, etc.
            </p>
          </div>
        )}

        {task.submission_type === 'file' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload your file
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${file ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50'}`}>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                {file ? (
                  <div>
                    <p className="text-2xl mb-2">📎</p>
                    <p className="text-sm font-bold text-brand-700">{file.name}</p>
                    <p className="text-xs text-brand-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-3">☁️</p>
                    <p className="text-sm font-semibold text-gray-700">Click to upload a file</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      PDF, DOCX, PNG, ZIP — max 10 MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </>
          ) : (
            'Submit Task →'
          )}
        </button>

      </form>
    </>
  )
}
