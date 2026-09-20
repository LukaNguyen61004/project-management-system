import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { AppHeader } from '../components/layout/AppHeader'
import { CinderBackdrop } from '../components/layout/CinderBackdrop'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { uploadAvatar } from '../utils/uploadAvatar'
import { getApiErrorMessage } from '../utils/apiError'
import { toast } from 'sonner'
import { useT } from '../i18n/useT'

export function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const t = useT()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getMe().then((r) => r.data.data),
  })

  useEffect(() => {
    if (profile) {
      setName(profile.user_name || '')
      setAvatarUrl(profile.user_avatar_url)
    }
  }, [profile])

  const saveMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        user_name: name.trim(),
        user_avatar_url: avatarUrl || undefined,
      }),
    onSuccess: (res) => {
      toast.success(t('profile.saved'))
      updateUser(res.data.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate('/projects')
    },
    onError: (err) => {
      const msg = getApiErrorMessage(err, t('profile.saveFailed'))
      setError(msg)
      toast.error(msg)
    },
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadAvatar(currentUser.user_id, file)
      setAvatarUrl(url)
      toast.success(t('profile.uploaded'))
    } catch (err) {
      const msg = getApiErrorMessage(err, t('profile.uploadFailed'))
      setError(msg)
      toast.error(msg)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-jira-bg p-6">{t('profile.loading')}</div>
  }

  return (
    <div className="relative min-h-screen">
      <CinderBackdrop />
      <div className="relative z-10 p-3 sm:p-6 space-y-4">
      <AppHeader title={t('profile.title')} subtitle={profile?.user_email} />

      <div className="max-w-lg mx-auto">
        <div className="cinder-glass rounded-[20px] p-6 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar
                name={name || profile?.user_email}
                src={avatarUrl}
                size="lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-jira-blue text-[#151414] hover:bg-jira-blue-dark"
                title={t('profile.changeAvatar')}
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="text-xs text-jira-text-subtle">
              {uploading ? t('profile.uploading') : t('profile.avatarHint')}
            </p>
          </div>

          <Input
            label={t('profile.displayName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile.namePlaceholder')}
          />

          <div>
            <label className="text-sm font-medium text-jira-text">{t('auth.email')}</label>
            <p className="mt-1 text-sm text-jira-text-subtle">{profile?.user_email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-jira-text">{t('profile.loginMethod')}</label>
            <p className="mt-1 text-sm text-jira-text-subtle capitalize">
              {profile?.provider?.toLowerCase()}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/projects')}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={name.trim().length < 2 || saveMutation.isPending || uploading}
            >
              {saveMutation.isPending ? t('common.saving') : t('profile.save')}
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}