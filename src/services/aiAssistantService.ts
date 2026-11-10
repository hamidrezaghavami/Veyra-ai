import { api } from './api'
import type { ChatMessage } from '../shared/types'
export type AssistantMessage = ChatMessage
export const aiAssistantService = {
  processQuestion: (message: string, locale: 'en'|'tr' = 'en') => api<ChatMessage>('/chat', { method: 'POST', body: JSON.stringify({ message, locale }) }),
}
