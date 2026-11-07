import { api } from './api'
import type { ChatMessage } from '../backend/types'
export type AssistantMessage = ChatMessage
export const aiAssistantService = {
  processQuestion: (message: string) => api<ChatMessage>('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}
