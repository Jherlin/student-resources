import { useState, useContext, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios";
import GlobalContext from "../providers/GlobalContext"
import { UserContextType } from "../@types/user";

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
    });

    const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

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
        <div className="page-register">
            <h1 className="title">Register</h1>

            {error && error}
          <form onSubmit={(e)=> {onSubmitForm(e)}}>
            <label>First Name:</label>
            <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
            />
            <label>Last Name:</label>
            <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
            />
            <label>Username:</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <label>Password:</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button>Register</button>
          </form>
            {loading && <p>Loading...</p>}
        </div>
    )
}

export default Register;
