import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ProfessionalsProvider } from './providers/ProfessionalsProvider'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('No se encontró el elemento #root en index.html')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ProfessionalsProvider>
        <App />
      </ProfessionalsProvider>
    </BrowserRouter>
  </StrictMode>,
)
