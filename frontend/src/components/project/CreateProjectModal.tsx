import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../api/project.api";
import { getApiErrorMessage } from "../../utils/apiError";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useT } from "../../i18n/useT";

interface CreateProjectModalProps {
    open: boolean
    onClose: () => void
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
    const [name, setName] = useState('')
    const [key, setKey] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const t = useT()

    const queryClient = useQueryClient()
    const resetForm = () => {
        setName('')
        setKey('')
        setDescription('')
        setError('')
    }

    const mutation = useMutation({
        mutationFn: (data: { name: string, key: string, description: string }) =>
            projectApi.create({
                project_name: data.name,
                project_key: data.key,
                project_description: data.description || undefined,
            }),
        onSuccess: () => {
            toast.success(t('project.created'))
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            resetForm()
            onClose()
        },
        onError: (error) => {
            const msg = getApiErrorMessage(error, t('project.createFailed'))
            setError(msg)
            toast.error(msg)
        }
    }
    )

    const handleNameChange = (value: string) => {
        setName(value)
        if (!key) {
            setKey(
                value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5)
            )
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        mutation.mutate({ name, key: key.toUpperCase(), description })
    }

    return (
        <Modal open={open} onClose={onClose} title={t('project.create')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label={t('project.name')} value={name} onChange={(e) => handleNameChange(e.target.value)} />
                <Input label={t('project.key')} value={key} onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} minLength={2} maxLength={10} required />
                <div>
                    <label className="text-sm font-medium text-jira-text">{t('project.description')}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 w-full rounded border border-jira-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jira-blue"
                        placeholder={t('common.optional')}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button className="mr-2" type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
            </form>
        </Modal>
    )
}