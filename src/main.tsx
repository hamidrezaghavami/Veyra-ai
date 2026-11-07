import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

class AppErrorBoundary extends React.Component<{children: React.ReactNode}, {failed: boolean}> {
  state = { failed: false }
  static getDerivedStateFromError() { return {failed:true} }
  render() {
    if(this.state.failed) return <main className="max-w-lg p-8 mx-auto pt-24"><h1 className="text-2xl">Something went wrong</h1><p role="alert" className="my-4">Please reload the page to try again. Your saved invoices are kept in your account.</p><a href="/" className="action-button">Return Home</a></main>
    return this.props.children
  }
}
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><AppErrorBoundary><MotionConfig reducedMotion="user"><App /></MotionConfig></AppErrorBoundary></React.StrictMode>
)
