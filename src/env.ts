export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://admin.luniq.net'
export const STATUS_LABELS = {
    published: 'Опубликован',
    draft: 'Не опубликован',
    modified: 'Изменен',
} as const