import { useState, useContext, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import GlobalContext from "../providers/GlobalContext"
import { UserContextType } from "../@types/user";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Register = () => {
    const globalContext = useContext(GlobalContext) as UserContextType;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        username: "",
        password: "",
        confirmPassword: ""
    });

    const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting register form")
        axios
            .post(`${process.env.REACT_APP_BASE_URL}/register`, formData, {
                withCredentials: true,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data.user);
                    globalContext.setUser(response.data.user);
                    navigate("/dashboard");
                }
            })
            .catch((error) => {
                setError(error.response.data);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
      <div className="main-content">
        <div className="container">
          <h1 className="form-title">Register</h1>
          {error && error}
          <form className="register-form" onSubmit={(e)=> {onSubmitForm(e)}}>
            <TextField
              required
              label="First Name"
              variant="filled"
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            />
            <TextField
              required
              label="Last Name"
              variant="filled"
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            />
            <TextField
              required
              autoComplete="off"
              label="Username"
              variant="filled"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <TextField
              required
              label="Password"
              variant="filled"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
              <TextField
              required
              label="Confirm Password"
              variant="filled"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            <Button type="submit" variant="contained">Register</Button>
          </form>
              {loading && <p>Loading...</p>}
        </div>
      </div>
    )
}

export default Register;
