import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { Data } from "../@types/data";
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext";
import PendingRequests from "./PendingRequests";
import { url, axiosConfig } from "../axiosConfig";

const AdminPanel = () => {
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const navigate = useNavigate();
  const [data, setData] = useState<Data[] | []>([]);

  const acceptRequest = async (id: string) => {
    try {
      const response = await axios.put(`${url}/update-status`, {resourceId: id} , axiosConfig)
      
      if (response.status === 200) {
        setData(data.filter(item => item.id !== id));
      }

    } catch (error) {
      console.log(error);
    }
  }

  const declineRequest = async (id: string) => {
    try {
      const response = await axios.delete(`${url}/delete-resource/${id}`, axiosConfig)
      
      if (response.status === 200) {
        setData(data.filter(item => item.id !== id));
      };
    } catch (error) {
      console.log(error);
    }
  }

  const getPendingRequests = async () => {
    try {
      const response = await axios.post(`${url}/fetch-pending`, null, axiosConfig)
        
      if (response.status === 200) {
        setData(response.data);
        };
    } catch (error) {
      console.log(error);
    }
    };

  useEffect(() => {
    if (user.role !== "Admin"){
      return navigate("/login", { 
        state: { 
          route: "/admin"
        }});
    }

    getPendingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        {user.role === "Admin" &&
        <div className="admin-header">
          <h1>Administrator Panel</h1>
          <h2>Resources Pending Approval:</h2> 
        </div>
        }
        {data && <PendingRequests data={data} acceptRequest={acceptRequest} declineRequest={declineRequest}/>}
      </div>
    </div>
  );
}

export default AdminPanel;
