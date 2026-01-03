import Login from './pages/Login.jsx'
import CreateUser from './pages/CreateUser.jsx'
import CreateStudent from './pages/CreateStudent.jsx'
import Header from './components/Header.jsx'
import NavBar from './components/NavBar.jsx'


function App() {

  const isLoggedIn = !!localStorage.getItem('token')
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : null
  const userRole = user?.role || null
  const renderview = () => {
    if (!isLoggedIn) {
      return <Login />
    }
    switch (userRole) {
      case 'super':
        return <>
          <CreateStudent />
          <CreateUser />
        </>
      case 'admin':
      case 'desk':
        return <CreateStudent />
      case 'student':
        return <h1>Welcome {localStorage.getItem('name')}!</h1>
      default: return <p>Access Denied/Unknown Role</p>
    }

  }
  return (
    <>
      <NavBar />
      <Header />
      {renderview()}


    </>
  )
}

export default App
