import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Login from './pages/Login.jsx'
import CreateStudent from './pages/CreateStudent.jsx'
import { Routes, Route } from 'react-router-dom'
import CreateUser from './pages/CreateUser.jsx'
import ListAllStudents from './pages/ListAllStudents.jsx'
import App from './App.jsx'
import NavBar from './components/NavBar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/create-student" element={<CreateStudent />} />
        <Route path='/all-students' element={<ListAllStudents />} />
        
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
