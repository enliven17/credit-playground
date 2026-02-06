'use client'

import * as React from 'react'
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  contractCode?: string
}

export interface AIAssistantRef {
  askAboutCode: (code: string) => void
}

const AIAssistant = forwardRef<AIAssistantRef, AIAssistantProps>(({ contractCode }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your Creditcoin AI Assistant. I can help you with smart contract development, Creditcoin documentation, and answer questions about the platform. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    askAboutCode: (code: string) => {
      setIsOpen(true)
      const prompt = `I have a question about this part of my code:\n\n\`\`\`solidity\n${code}\n\`\`\`\n\nCan you explain what this does or if there are any issues with it?`
      handleExternalMessage(prompt)
    }
  }))

  const handleExternalMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content,
      timestamp: new Date()
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          contractCode,
          conversationHistory: messages.slice(-5)
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      setMessages((prev: Message[]) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }
      setMessages((prev: Message[]) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    handleExternalMessage(inputMessage)
    setInputMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { text: 'Explain this contract', icon: DocumentTextIcon },
    { text: 'How to deploy on Creditcoin?', icon: SparklesIcon },
    { text: 'Gas optimization tips', icon: SparklesIcon },
    { text: 'Security best practices', icon: SparklesIcon },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
      >
        <SparklesIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          <div className="w-[450px] h-[700px] bg-[#1e1e1e] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-white" />
                <div>
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                  <p className="text-white/80 text-xs">Creditcoin Expert</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2d2d30] text-white border border-white/10 shadow-sm'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2d2d30] text-white border border-white/10 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && !isLoading && (
              <div className="p-4 border-t border-white/10 bg-[#252526]">
                <p className="text-white/60 text-xs mb-3 font-medium uppercase tracking-wider">Quick actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleExternalMessage(action.text)}
                      className="text-left p-2.5 bg-[#2d2d30] hover:bg-[#3e3e42] rounded-xl text-xs text-white/80 hover:text-white transition-all border border-white/10 hover:border-white/20 active:scale-95 flex items-center space-x-2"
                    >
                      <action.icon className="h-3.5 w-3.5 text-blue-400" />
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-white/10 bg-[#252526]">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about Creditcoin..."
                  className="flex-1 bg-[#1e1e1e] text-white placeholder-white/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all active:scale-90"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

AIAssistant.displayName = 'AIAssistant'
export default AIAssistant
