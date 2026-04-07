import { BrowserRouter } from "react-router-dom";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

const Homepage = () => <div><h1>MultiChat Client</h1><p>Main chat TODO</p></div>
const Login = () => <div><h1>Login</h1></div>
const Signup = () => <div><h1>Signup</h1></div>

function App() {
  const isUserAuthenticated = false;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isUserAuthenticated ? <Home /> : <Navigate to="/login"/>}
        />

        {/* After this comment assume user is Authenticated */}
        <Route 
          path="/login"
          element={<Login/>}
        />
        <Route 
          path="/signup"
          element={<Signup/>}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App