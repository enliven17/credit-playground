'use client'

import { useState } from 'react'
import { ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { CONTRACT_TEMPLATES } from '@/lib/contractTemplates'
import { ContractTemplate } from '@/types/contract'

interface TemplateSelectorProps {
  onSelectTemplate: (template: ContractTemplate) => void
}

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'Tüm Kategoriler' },
    { id: 'token', name: 'Token Contracts' },
    { id: 'defi', name: 'DeFi Contracts' },
    { id: 'nft', name: 'NFT Contracts' },
    { id: 'governance', name: 'Governance' },
    { id: 'utility', name: 'Utility' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? CONTRACT_TEMPLATES 
    : CONTRACT_TEMPLATES.filter(template => template.category === selectedCategory)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary w-full flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-4 w-4" />
          <span>Template Seç</span>
        </div>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          {/* Category Filter */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Templates List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredTemplates.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Bu kategoride template bulunamadı
              </div>
            ) : (
              filteredTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectTemplate(template)
                    setIsOpen(false)
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      template.category === 'token' ? 'bg-blue-500' :
                      template.category === 'defi' ? 'bg-green-500' :
                      template.category === 'nft' ? 'bg-purple-500' :
                      template.category === 'governance' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {template.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">
                        {template.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}