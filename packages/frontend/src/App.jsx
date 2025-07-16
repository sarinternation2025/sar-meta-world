import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { sendMessage, setInputMessage } from './features/chat/chatSlice'
import { config } from './config'
import ChatWindow from './features/chat/components/ChatWindow'
import { connect } from './features/chat/api/socket'
import { DashboardLayout } from './layouts'
import { useAppDispatch } from './app/hooks'
import AdminOnly from './components/AdminOnly'
import './App.css'

function AnalyticsDashboard() {
  return <div className="my-8 p-6 bg-white rounded-xl shadow text-center text-2xl font-bold text-[#2563EB]">[Admin] Analytics Dashboard (Coming Soon)</div>;
}
function ModelManagement() {
  return <div className="my-8 p-6 bg-white rounded-xl shadow text-center text-2xl font-bold text-[#8B5CF6]">[Admin] Model Management (Coming Soon)</div>;
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
