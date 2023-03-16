import { useContext, useState } from "react"
import GlobalContext from "../providers/GlobalContext"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios";
import { User, UserContextType } from "../@types/user";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header = () => {
    const [toggle, setToggle] = useState(false);
    const globalContext = useContext(GlobalContext) as UserContextType;
    const navigate = useNavigate();
    const user = globalContext.user as User;
    const matches = useMediaQuery('(max-width:767px)');

    const logout = () => {
        handleToggle();
        axios
            .post(`${process.env.REACT_APP_BASE_URL}/logout`, null, {
                withCredentials: true,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    globalContext.setUser({
                      id: "",
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                      role: ""
                    });
                    navigate("/");
                } else {
                    throw new Error()
                }
            })
            .catch((error) => {
                console.error(`Couldn"t log the user out: ${error}`)
            })
    }

    const refreshPage = () => {
      const homeUrl = window.location.protocol + "//" + window.location.host + "/";
      const pathName = window.location.pathname;

      if (pathName === "/register" || 
        pathName === "/login" || 
        pathName === "/dashboard" || 
        pathName === "/submittals" || 
        pathName === "/admin") {
        return;
      };
    
      window.location.replace(homeUrl);
    };

    const handleToggle = () => {
      if(matches){
        setToggle(prev => !prev);
      }
    }

    const handleLogin = () => {
      handleToggle();
      navigate("/login")
    }

    return (
      <header>
      <nav className={toggle ? "overlay" : "nav-bar"}>
        <div className={toggle ? "navbar-left-container hide-search-icon " : "navbar-left-container"}>
          <Link to="/"><SearchIcon onClick={refreshPage}/></Link>
        </div>
        <div className={toggle ? "hide-menu" : "menu"}>
          <MenuIcon onClick={() => setToggle(prev => !prev)}/>
        </div>
        <ul className={toggle ? "overlay-content" : "navbar-right-container"} style={{width: user.id && "460px"}}>
          <li onClick={handleToggle} className="close-icon"><CloseIcon /></li>
          <li onClick={handleToggle}><Link to="/" onClick={refreshPage}>Home</Link></li>
          <li onClick={handleToggle}><Link to="/submittals">Submit a Resource</Link></li>
          {!user.id ? 
          <li onClick={handleToggle}><Link to="/register">Register</Link></li> :
          <li onClick={handleToggle}><Link to="/dashboard">Dashboard</Link></li>}
          {user.role === "Admin" && <li onClick={handleToggle}><Link to="/admin">Admin Panel</Link></li>}
          {user.id ? (<button onClick={logout}>Logout</button>) : (<button onClick={handleLogin}>Login</button>)}
        </ul>  
      </nav>
    </header>
    )
}

export default Header