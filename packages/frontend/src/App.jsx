import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { sendMessage, setInputMessage } from './features/chat/chatSlice'
// import { config } from './config' // Commented out unused import
import ChatWindow from './features/chat/components/ChatWindow'
import { connect } from './features/chat/api/socket'
import { DashboardLayout } from './layouts'
import { useAppDispatch } from './app/hooks'
import AdminOnly from './components/AdminOnly'
import SystemMonitor from './components/SystemMonitor'
import './App.css'

function AnalyticsDashboard() {
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg border border-blue-200">
      <h2 className="text-2xl font-bold text-[#2563EB] mb-4">📊 Analytics Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-3 rounded-lg shadow">
          <div className="text-blue-600 font-semibold">Total Requests</div>
          <div className="text-2xl font-bold text-gray-800">12,847</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow">
          <div className="text-green-600 font-semibold">Success Rate</div>
          <div className="text-2xl font-bold text-gray-800">98.5%</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow">
          <div className="text-purple-600 font-semibold">Avg Response</div>
          <div className="text-2xl font-bold text-gray-800">120ms</div>
        </div>
      </div>
    </div>
  );
}

function ModelManagement() {
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200">
      <h2 className="text-2xl font-bold text-[#8B5CF6] mb-4">🤖 Model Management</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">GPT-4 Model</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
          </div>
          <div className="text-xs text-gray-500">Last updated: 2 hours ago</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-700">Claude-3 Model</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
          </div>
          <div className="text-xs text-gray-500">Last updated: 1 hour ago</div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const dispatch = useAppDispatch()
  const selectChat = state => state.chat
  const { isConnected, messages, inputMessage, isLoading, error } = useSelector(selectChat)

  useEffect(() => {
    // Initialize socket connection
    connect()
  }, [])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      dispatch(sendMessage(inputMessage))
    }
  }

  const handleInputChange = (e) => {
    dispatch(setInputMessage(e.target.value))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-600 via-purple-500 to-green-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight uppercase">
          SAR-META-WORLD
        </h1>
        <div className="text-center text-[#10B981] font-semibold text-lg mb-6 tracking-wide">
          Smart Autonomous Resource - Unified Admin Dashboard
        </div>
        <AdminOnly>
          <AnalyticsDashboard />
          <ModelManagement />
          <SystemMonitor />
        </AdminOnly>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}
        <div className="flex justify-center">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            inputValue={inputMessage}
            onInputChange={handleInputChange}
            onInputKeyDown={handleKeyDown}
            isConnected={isConnected}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default App
