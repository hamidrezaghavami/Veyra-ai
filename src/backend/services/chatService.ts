import { db } from '../db/store.ts'
import { GeminiClient } from '../gemini/client.ts'
import { ChatMessage } from '../types.ts'

export class ChatService {
  static async handleUserQuery(query: string): Promise<ChatMessage> {
    const activeInvoices = db.getInvoices()

    const result = await GeminiClient.answerFinancialQuery(query, activeInvoices)

    return {
      id: `msg-${Date.now().toString(36)}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referencedInvoices: result.referencedInvoices,
      suggestedActions: result.suggestions,
    }
  }
}
