import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { FileSystemProvider } from './hooks/useFileSystem.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FileSystemProvider>
      <App />
    </FileSystemProvider>
  </React.StrictMode>,
)
