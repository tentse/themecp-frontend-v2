import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Highcharts from 'highcharts'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

// Highcharts writes its own font-family inline onto the chart container, which
// beats the global monospace rule in index.css. Point it at the same stack so
// axis labels, legends and tooltips stay monospace too.
Highcharts.setOptions({
  chart: {
    style: {
      fontFamily:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--font-sans')
          .replace(/\s+/g, ' ')
          .trim() || 'monospace',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
