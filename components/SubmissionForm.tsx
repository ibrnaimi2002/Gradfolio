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
  if (typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return String(err)
}

export default function SubmissionForm({ task, userId }: SubmissionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Verify the session is still valid before attempting the insert
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('[SubmissionForm] no active session — redirecting to login')
        setToast({
          message: 'Your session has expired. Please sign in again.',
          type: 'error',
        })
        setTimeout(() => router.push('/login'), 1500)
        return
      }

      console.log('[SubmissionForm] session OK — user:', session.user.id)
      console.log('[SubmissionForm] task.id:', task.id, '| submission_type:', task.submission_type)

      let finalContent = content

      // --- File upload ---
      if (task.submission_type === 'file') {
        if (!file) {
          setToast({ message: 'Please select a file to upload.', type: 'error' })
          return
        }

        const ext = file.name.split('.').pop()
        const filePath = `${userId}/${task.id}/${Date.now()}.${ext}`
        console.log('[SubmissionForm] uploading file to path:', filePath)

        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(filePath, file)

        if (uploadError) {
          console.error('[SubmissionForm] file upload error:', uploadError)
          throw uploadError
        }

        const { data: urlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(filePath)

        finalContent = urlData.publicUrl
        console.log('[SubmissionForm] file uploaded — public URL:', finalContent)
      }

      // --- Validate content ---
      if (!finalContent.trim()) {
        setToast({ message: 'Please provide a submission before submitting.', type: 'error' })
        return
      }

      // --- Insert submission ---
      const payload = {
        user_id: userId,
        task_id: task.id,
        content: finalContent.trim(),
        status: 'submitted',
      }
      console.log('[SubmissionForm] inserting submission:', payload)

      const { data: insertedRow, error: insertError } = await supabase
        .from('submissions')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        console.error('[SubmissionForm] insert error:', insertError)
        throw insertError
      }

      console.log('[SubmissionForm] submission saved — id:', insertedRow?.id)
      setToast({ message: 'Submission sent successfully!', type: 'success' })
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err: unknown) {
      const msg = extractMessage(err)
      console.error('[SubmissionForm] caught error:', err)
      setToast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {task.submission_type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write your solution here..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              required
            />
          </div>
        )}

        {task.submission_type === 'link' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link to your work
            </label>
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              GitHub repo, Figma file, Google Docs, etc.
            </p>
          </div>
        )}

        {task.submission_type === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload your file
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-400 transition-colors">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-brand-600">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(1)} KB — click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">Click to upload a file</p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOCX, PNG, ZIP up to 10MB
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
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Submitting...' : 'Submit Task'}
        </button>
      </form>
    </>
  )
}
