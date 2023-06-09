import { useState, useContext, FormEvent, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios, { AxiosError } from "axios";
import GlobalContext from "../providers/GlobalContext"
import { UserContextType } from "../@types/user";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { url, axiosConfig } from "../axiosConfig";

const Login = () => {
const { user, fetchingUser, setUser } = useContext(GlobalContext) as UserContextType;
const navigate = useNavigate();
const { state } = useLocation();
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>("");
const [formData, setFormData] = useState({
    email: "",
    password: "",
})

const onSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true)
  try {
    const response = await axios.post(`${url}/login`, formData, axiosConfig)
    
    if (response.status === 200) {
      setUser(response.data.user);
      navigate("/dashboard");
    }
  } catch (error) {
    const err = error as AxiosError;
      setError(err.response?.data as string);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (user.id && state.route === "/submittals") {
    navigate("/submittals")
  } else if (user.id && state.route === "/dashboard") {
    navigate("/dashboard")
  } else if (user.role === "Admin" && state.route === "/admin") {
    navigate("/admin")
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);

return (
  <div className="main-content">
    <div className="container">
      {!fetchingUser &&
      <>
      <h1 className="form-title">Login</h1>
        <div className="form-error">{error && error}</div>
        <form className="login-form" onSubmit={(e) => onSubmitForm(e)}> 
          <TextField
          required
          autoComplete="off"
          label="Email"
          variant="filled"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
          <TextField
          required
          label="Password"
          variant="filled"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
          <Button type="submit" variant="contained">Login</Button>
        </form>
        </>
        }
        {loading && <p className="form-loading-text">Loading...</p>}
    </div>
  </div>
)
}

export default Login;
