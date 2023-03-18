import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { UserContextType, UserStats } from "../@types/user";
import GlobalContext from "../providers/GlobalContext"

const Dashboard = () => {
  const { user } = useContext(GlobalContext) as UserContextType;
  const [ userStats, setUserStats] = useState<UserStats>({
    dateJoined:"",
    count:""
  });

  const navigate = useNavigate();
  
  const getUserStats = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fetch-userstats/${user.id}`,{
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })

      if(response.status === 200) {
        setUserStats(response.data)
      };
    } catch (error) {
      console.log(error);
    };
  };

  useEffect(() => {
    if (!user.id){
      return navigate("/login", { 
        state: { 
          route: "/dashboard"
        }});
    }

    getUserStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        <div className="dashboard-card">
          {user.id && (
              <>
                <h1 className="dashboard-title">Welcome to your dashboard {user.firstName}</h1>
                <div className="user-stats">
                  <p><b>Email: </b>{user.email}</p>
                  <p><b>Contributions: </b>{userStats.count}</p>
                  <p><b>Date Joined: </b>{new Date(userStats.dateJoined + "Z").toLocaleString("en-US", {
                      localeMatcher: "best fit",
                      timeZoneName: "short"
                      } )}  </p>
                </div>
              </>)}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
