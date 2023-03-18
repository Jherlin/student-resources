import { useState, useContext, FormEvent, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios, { AxiosError } from "axios";
import GlobalContext from "../providers/GlobalContext"
import { UserContextType } from "../@types/user";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const Register = () => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { user, setUser } = useContext(GlobalContext) as UserContextType;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        dateJoined: currentTime,
        role: "User"
    });

    const onSubmitForm = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
          const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/register`, formData, {
            withCredentials: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
          })

          if (response.status === 200) {
            setUser(response.data.user);
            navigate("/dashboard");
            }
        } catch (error) {
          const err = error as AxiosError;
          setError(err.response?.data as string);
        } finally {
          setLoading(false);
        };
    };

    useEffect(() => {
      if (user.id){
        navigate("/dashboard");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);
    
    return (
      <div className="main-content">
        <div className="container">
          <h1 className="form-title">Register</h1>
          <div className="form-error">{error && error}</div>
          <form className="register-form" onSubmit={(e)=> {onSubmitForm(e)}}>
            <TextField
              required
              label="First Name"
              variant="filled"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <TextField
              required
              label="Last Name"
              variant="filled"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            <TextField
              required
              autoComplete="off"
              label="Email"
              variant="filled"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          {loading && <p className="form-loading-text">Loading...</p>}
        </div>
      </div>
    )
}

export default Register;
