import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

const style = document.createElement('style')
style.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; background: #F9F8F5; } button, input, select, textarea { font-family: inherit; }`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
