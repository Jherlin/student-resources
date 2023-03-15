import { useState, useContext, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import GlobalContext from "../providers/GlobalContext"
import { UserContextType } from "../@types/user";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Login = () => {
    const globalContext = useContext(GlobalContext) as UserContextType;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const onSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true)

      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/login`, formData, {
          withCredentials: true,
          headers: {
              "Access-Control-Allow-Origin": "*",
          }
        })
        
        if (response.status === 200) {
          globalContext.setUser(response.data.user);
          navigate("/dashboard");
        }
      } catch (error) {
        setError("Error");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="main-content">
        <div className="container">
          <h1 className="form-title">Login</h1>
            {error && error}
            <form className="login-form" onSubmit={(e) => onSubmitForm(e)}> 
              <TextField
              required
              autoComplete="off"
              label="Username"
              variant="filled"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}/>
              <TextField
              required
              label="Password"
              variant="filled"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
              <Button type="submit" variant="contained">Login</Button>
            </form>
            {loading && <p>Loading...</p>}
        </div>
      </div>
    )
}

export default Login;
