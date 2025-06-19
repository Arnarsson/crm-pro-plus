import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface FileStatus {
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export function TaskExtractorUpload() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => ({
      name: file.name,
      status: 'pending'
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/javascript': ['.js'],
      'text/typescript': ['.ts', '.tsx'],
      'text/html': ['.html'],
      'text/css': ['.css']
    }
  });

  const processFiles = async () => {
    if (!files.length || isUploading) return;

    setIsUploading(true);
    const formData = new FormData();
    
    files.forEach(fileStatus => {
      const originalFile = files.find(f => f.name === fileStatus.name);
      if (originalFile) {
        formData.append('files', originalFile);
      }
    });

    try {
      const response = await fetch('/api/tasks/extract', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process files');
      }

      setFiles(prev => prev.map(file => {
        const result = data.results.find((r: any) => r.fileName === file.name);
        return {
          ...file,
          status: result?.status === 'success' ? 'success' : 'error',
          error: result?.error
        };
      }));
    } catch (error) {
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
        error: error.message
      })));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/10' 
            : 'border-gray-600 hover:border-indigo-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-300">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'
          }
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Supported files: .txt, .md, .js, .ts, .tsx, .html, .css
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-200">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                    {file.status === 'processing' && (
                      <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-xs text-red-400">{file.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={processFiles}
                disabled={isUploading}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${isUploading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                  }
                  transition-colors duration-200
                `}
              >
                {isUploading ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Extract Tasks'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 