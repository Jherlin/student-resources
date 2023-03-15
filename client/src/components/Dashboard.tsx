import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext"

const Dashboard = () => {
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.username){
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        <div>
          {user.username && (<h1>Welcome to your dashboard {user.username}</h1>)}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
