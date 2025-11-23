import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppDesktop from './AppDesktop.jsx'

// Use Desktop app if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
const AppComponent = isElectron ? AppDesktop : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>,
)
