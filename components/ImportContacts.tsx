'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Upload, Download, Users, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportContactsProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: { row: number; error: string }[]
}

export function ImportContacts({ isOpen, onClose, onSuccess }: ImportContactsProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'results'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredFields = ['first_name', 'last_name']
  const optionalFields = ['email', 'phone', 'company', 'position', 'notes', 'full_name']
  const allFields = [...requiredFields, ...optionalFields]

  const csvColumns = csvData.length > 0 ? csvData[0] : []

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      
      // Better CSV parsing that handles quoted fields with commas
      const parseCSVRow = (row: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < row.length; i++) {
          const char = row[i]
          const nextChar = row[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"'
              i++ // Skip next quote
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        
        if (current) {
          result.push(current.trim())
        }
        
        return result
      }
      
      const rows = text.split('\n')
        .map(row => parseCSVRow(row))
        .filter(row => row.some(cell => cell.length > 0))
      
      setCsvData(rows)
      
      // Auto-map common column names with improved logic
      const autoMapping: Record<string, string> = {}
      const headers = rows[0] || []
      headers.forEach((col, index) => {
        const lowerCol = col.toLowerCase().trim()
        
        // First Name variations
        if (lowerCol.match(/^(first\s*name|firstname|fname|given\s*name)$/)) {
          autoMapping[`col_${index}`] = 'first_name'
        }
        // Last Name variations  
        else if (lowerCol.match(/^(last\s*name|lastname|lname|surname|family\s*name)$/)) {
          autoMapping[`col_${index}`] = 'last_name'
        }
        // Full Name (map to first_name if no first name already mapped)
        else if (lowerCol.match(/^(full\s*name|fullname|name)$/) && !Object.values(autoMapping).includes('first_name')) {
          autoMapping[`col_${index}`] = 'first_name'
        }
        // Email variations
        else if (lowerCol.match(/^(email|emails|e-mail|email\s*address)$/)) {
          autoMapping[`col_${index}`] = 'email'
        }
        // Phone variations
        else if (lowerCol.match(/^(phone|phones|phonenumber|phone\s*number|telephone|mobile|cell)$/)) {
          autoMapping[`col_${index}`] = 'phone'
        }
        // Company variations
        else if (lowerCol.match(/^(company|companies|organization|org|employer|business)$/)) {
          autoMapping[`col_${index}`] = 'company'
        }
        // Position/Title variations
        else if (lowerCol.match(/^(position|title|job\s*title|role|designation)$/)) {
          autoMapping[`col_${index}`] = 'position'
        }
        // Notes variations
        else if (lowerCol.match(/^(notes|note|comments|description|remarks)$/)) {
          autoMapping[`col_${index}`] = 'notes'
        }
      })
      
      setMapping(autoMapping)
      setStep('mapping')
    }
    
    reader.readAsText(selectedFile)
  }

  const downloadTemplate = () => {
    const template = 'First Name,Last Name,Email,Phone,Company,Position,Notes\n'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contact_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validateMapping = () => {
    const mappedFields = Object.values(mapping)
    return requiredFields.every(field => mappedFields.includes(field))
  }

  const performImport = async () => {
    if (!validateMapping()) {
      alert('Please map all required fields (First Name, Last Name)')
      return
    }

    setStep('importing')
    setImporting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not authenticated')
      return
    }

    const contacts = []
    const errors: { row: number; error: string }[] = []

    // Skip header row
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i]
      const contact: any = { user_id: user.id }

      try {
        // Map CSV columns to contact fields
        Object.entries(mapping).forEach(([colKey, fieldName]) => {
          const colIndex = parseInt(colKey.replace('col_', ''))
          const value = row[colIndex]?.trim()
          
          if (value) {
            if (fieldName === 'tags') {
              contact[fieldName] = value.split(',').map(tag => tag.trim()).filter(Boolean)
            } else {
              contact[fieldName] = value
            }
          }
        })

        // Intelligent data extraction from unmapped fields
        const unmappedData: string[] = []
        row.forEach((value, index) => {
          const colKey = `col_${index}`
          if (!mapping[colKey] && value?.trim()) {
            unmappedData.push(value.trim())
          }
        })

        // Try to extract company and position from unmapped fields
        if (!contact.company || !contact.position) {
          unmappedData.forEach(data => {
            const lowerData = data.toLowerCase()
            
            // Common position keywords
            if (!contact.position && (
              lowerData.includes('manager') || lowerData.includes('director') ||
              lowerData.includes('ceo') || lowerData.includes('cto') || lowerData.includes('cfo') ||
              lowerData.includes('president') || lowerData.includes('vp') || 
              lowerData.includes('engineer') || lowerData.includes('developer') ||
              lowerData.includes('analyst') || lowerData.includes('consultant') ||
              lowerData.includes('specialist') || lowerData.includes('coordinator') ||
              lowerData.includes('lead') || lowerData.includes('head of') ||
              lowerData.includes('executive') || lowerData.includes('officer')
            )) {
              contact.position = data
            }
            
            // Common company patterns (ends with Ltd, Inc, LLC, etc)
            else if (!contact.company && (
              data.match(/\b(inc|incorporated|corp|corporation|ltd|limited|llc|llp|company|co\.?)\b/i) ||
              data.match(/\b(group|holdings|partners|associates|solutions|services|systems|technologies)\b/i)
            )) {
              contact.company = data
            }
          })
        }

        // Handle full name field if first/last names are missing
        if ((!contact.first_name || !contact.last_name) && contact.full_name) {
          const nameParts = contact.full_name.trim().split(/\s+/)
          if (nameParts.length >= 2) {
            if (!contact.first_name) contact.first_name = nameParts[0]
            if (!contact.last_name) contact.last_name = nameParts.slice(1).join(' ')
          } else if (nameParts.length === 1) {
            if (!contact.first_name) contact.first_name = nameParts[0]
            if (!contact.last_name) contact.last_name = nameParts[0]
          }
          delete contact.full_name // Remove temporary field
        }

        // Validate required fields
        if (!contact.first_name || !contact.last_name) {
          errors.push({ row: i + 1, error: 'Missing required fields (First Name or Last Name)' })
          continue
        }

        // Validate email format if provided
        if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
          errors.push({ row: i + 1, error: 'Invalid email format' })
          continue
        }

        contacts.push(contact)
      } catch (error) {
        errors.push({ row: i + 1, error: `Error processing row: ${error}` })
      }
    }

    // Import contacts in batches
    let successful = 0
    const batchSize = 100

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      
      try {
        const { error } = await supabase
          .from('contacts')
          .insert(batch)

        if (error) {
          batch.forEach((_, index) => {
            errors.push({ 
              row: i + index + 2, // +2 for header and 0-based index
              error: error.message 
            })
          })
        } else {
          successful += batch.length
        }
      } catch (error) {
        batch.forEach((_, index) => {
          errors.push({ 
            row: i + index + 2,
            error: `Database error: ${error}` 
          })
        })
      }
    }

    setImportResult({
      total: csvData.length - 1, // Exclude header
      successful,
      failed: errors.length,
      errors
    })

    setImporting(false)
    setStep('results')
  }

  const resetImport = () => {
    setStep('upload')
    setFile(null)
    setCsvData([])
    setMapping({})
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetImport()
    onClose()
    if (importResult && importResult.successful > 0) {
      onSuccess()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Import Contacts
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                {[
                  { key: 'upload', label: 'Upload File' },
                  { key: 'mapping', label: 'Map Fields' },
                  { key: 'importing', label: 'Import' },
                  { key: 'results', label: 'Results' }
                ].map((stepItem, index) => (
                  <div key={stepItem.key} className="flex items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      step === stepItem.key ? 'bg-blue-600 text-white' :
                      ['mapping', 'importing', 'results'].includes(step) && index < ['upload', 'mapping', 'importing', 'results'].indexOf(step) ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      step === stepItem.key ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {stepItem.label}
                    </span>
                    {index < 3 && (
                      <div className={`ml-4 h-1 w-12 rounded ${
                        ['mapping', 'importing', 'results'].includes(step) && index < ['upload', 'mapping', 'importing', 'results'].indexOf(step) ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mt-2">
                    <div className="flex justify-center">
                      <div className="w-full max-w-md">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Choose CSV file to upload
                              </span>
                              <input
                                ref={fileInputRef}
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".csv"
                                className="sr-only"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">CSV files only</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Import Guidelines</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>CSV file must include First Name and Last Name columns</li>
                          <li>Optional columns: Email, Phone, Company, Position, Notes</li>
                          <li>First row should contain column headers</li>
                          <li>Maximum 1000 contacts per import</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'mapping' && csvData.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Map CSV columns to contact fields
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {csvColumns.map((column, index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-black">
                          CSV Column: "{column}"
                        </label>
                        <select
                          value={mapping[`col_${index}`] || ''}
                          onChange={(e) => setMapping(prev => ({
                            ...prev,
                            [`col_${index}`]: e.target.value
                          }))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                        >
                          <option value="">Skip this column</option>
                          {allFields.map(field => (
                            <option key={field} value={field}>
                              {field === 'full_name' ? 'Full Name (will split into First/Last)' : field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {requiredFields.includes(field) && ' *'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Preview (first 3 rows):</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr>
                          {Object.values(mapping).filter(field => field && field !== 'full_name').map(field => (
                            <th key={field} className="px-2 py-1 text-left font-medium text-black bg-gray-100">
                              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.slice(1, 4).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {Object.entries(mapping).filter(([_, field]) => field && field !== 'full_name').map(([colKey, field]) => {
                              const colIndex = parseInt(colKey.replace('col_', ''))
                              
                              // Show split names if full_name is mapped
                              if ((field === 'first_name' || field === 'last_name') && Object.values(mapping).includes('full_name')) {
                                const fullNameCol = Object.entries(mapping).find(([_, f]) => f === 'full_name')
                                if (fullNameCol) {
                                  const fullNameIndex = parseInt(fullNameCol[0].replace('col_', ''))
                                  const fullName = row[fullNameIndex]?.trim() || ''
                                  const nameParts = fullName.split(/\s+/)
                                  if (field === 'first_name') {
                                    return <td key={colKey} className="px-2 py-1 text-black">{nameParts[0] || '-'}</td>
                                  } else {
                                    return <td key={colKey} className="px-2 py-1 text-black">{nameParts.slice(1).join(' ') || '-'}</td>
                                  }
                                }
                              }
                              
                              return (
                                <td key={colKey} className="px-2 py-1 text-black">
                                  {row[colIndex] || '-'}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('upload')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={performImport}
                    disabled={!validateMapping()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import {csvData.length - 1} Contacts
                  </button>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-lg font-medium text-gray-900">Importing contacts...</p>
                <p className="text-sm text-gray-500">This may take a moment for large files</p>
              </div>
            )}

            {step === 'results' && importResult && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                    importResult.failed === 0 ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {importResult.failed === 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900">Import Complete</h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                    <div className="text-sm text-gray-500">Total Records</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{importResult.successful}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{importResult.failed}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Import Errors:</h4>
                    <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index}>Row {error.row}: {error.error}</div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div className="text-red-600 font-medium">
                          ... and {importResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={resetImport}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Import More Contacts
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}