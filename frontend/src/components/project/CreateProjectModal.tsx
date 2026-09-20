import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../api/project.api";
import { getApiErrorMessage } from "../../utils/apiError";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useT } from "../../i18n/useT";
import type { MessageKey } from "../../i18n/useT";

interface CreateProjectModalProps {
    open: boolean
    onClose: () => void
}

type FieldErrors = {
    name?: string
    key?: string
    description?: string
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
    const [name, setName] = useState('')
    const [key, setKey] = useState('')
    const [description, setDescription] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [error, setError] = useState('')
    const t = useT()

    const queryClient = useQueryClient()
    const resetForm = () => {
        setName('')
        setKey('')
        setDescription('')
        setFieldErrors({})
        setError('')
    }

    const clearFieldError = (field: keyof FieldErrors) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    const validate = (): FieldErrors => {
        const errors: FieldErrors = {}
        const trimmedName = name.trim()
        const trimmedKey = key.trim().toUpperCase()

        if (trimmedName.length < 3) errors.name = t('project.nameMin')
        else if (trimmedName.length > 100) errors.name = t('project.nameMax')

        if (trimmedKey.length < 2) errors.key = t('project.keyMin')
        else if (trimmedKey.length > 10) errors.key = t('project.keyMax')
        else if (!/^[A-Z]+$/.test(trimmedKey)) errors.key = t('project.keyFormat')

        if (description.length > 500) errors.description = t('project.descriptionMax')

        return errors
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
        onError: (err) => {
            const msg = getApiErrorMessage(err, t('project.createFailed'))
            const mapped = mapApiErrorToFields(msg, t)
            if (Object.keys(mapped).length > 0) {
                setFieldErrors(mapped)
                return
            }
            setError(msg)
            toast.error(msg)
        }
    }
    )

    const handleNameChange = (value: string) => {
        setName(value)
        clearFieldError('name')
        if (!key) {
            setKey(
                value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5)
            )
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        const errors = validate()
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) return
        mutation.mutate({ name: name.trim(), key: key.trim().toUpperCase(), description })
    }

    return (
        <Modal open={open} onClose={onClose} title={t('project.create')}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Input
                    label={t('project.name')}
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    maxLength={100}
                    hint={t('project.nameHint')}
                    error={fieldErrors.name}
                />
                <Input
                    label={t('project.key')}
                    value={key}
                    onChange={(e) => {
                        setKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))
                        clearFieldError('key')
                    }}
                    maxLength={10}
                    hint={t('project.keyHint')}
                    error={fieldErrors.key}
                />
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-jira-text font-[Hind]">{t('project.description')}</label>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                            clearFieldError('description')
                        }}
                        rows={3}
                        maxLength={500}
                        className={`w-full rounded-2xl border bg-transparent px-3 py-2 text-sm text-jira-text placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/25 ${
                            fieldErrors.description ? 'border-red-500' : 'border-jira-border'
                        }`}
                        placeholder={t('common.optional')}
                    />
                    <span className="text-xs text-jira-text-subtle">{t('project.descriptionHint')}</span>
                    {fieldErrors.description && (
                        <span className="text-xs text-red-500">{fieldErrors.description}</span>
                    )}
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

function mapApiErrorToFields(
    message: string,
    t: (key: MessageKey) => string,
): FieldErrors {
    const errors: FieldErrors = {}

    for (const part of message.split(/\. (?=[A-Z])/)) {
        const lower = part.toLowerCase()
        if (lower.includes('project key already')) {
            errors.key = t('project.keyTaken')
        } else if (lower.includes('project name') && lower.includes('100')) {
            errors.name = t('project.nameMax')
        } else if (lower.includes('project name')) {
            errors.name = t('project.nameMin')
        } else if (lower.includes('project key') && (lower.includes('uppercase') || lower.includes('letters'))) {
            errors.key = t('project.keyFormat')
        } else if (lower.includes('project key') && lower.includes('10')) {
            errors.key = t('project.keyMax')
        } else if (lower.includes('project key')) {
            errors.key = t('project.keyMin')
        } else if (lower.includes('description')) {
            errors.description = t('project.descriptionMax')
        }
    }

    return errors
}
