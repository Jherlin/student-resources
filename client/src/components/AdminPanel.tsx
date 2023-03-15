import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { Data } from "../@types/data";
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext";
import PendingRequests from "./PendingRequests";

const AdminPanel = () => {
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const navigate = useNavigate();

  const [data, setData] = useState<Data[] | []>([]);
  const [error, setError] = useState<string | undefined>();

  const acceptRequest = (id: string) => {
    axios
    .put(`${process.env.REACT_APP_BASE_URL}/update-status`, {resourceId: id} , {
        withCredentials: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    })
    .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setData(data.filter(item => item.id !== id));
        }
    })
    .catch((error) => {
      console.log(error.response.data);
  })
  }

  const declineRequest = (id: string) => {
    axios
    .delete(`${process.env.REACT_APP_BASE_URL}/delete-resource`,{
        data: {resourceId: id},
        withCredentials: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    })
    .then((response) => {
        if (response.status === 200) {
          console.log("Resource was deleted");
          setData(data.filter(item => item.id !== id));
        }
    })
    .catch((error) => {
      console.log(error);

  })
  }

  const getPendingRequests = () => {
    axios
        .post(`${process.env.REACT_APP_BASE_URL}/fetch-pending`, null, {
            withCredentials: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        })
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
                setData(response.data);
            }
        })
        .catch((error) => {
          setError(error.response.data);
  
      })
    };

  useEffect(() => {
    console.log(user);
    if (user.username !== "admin"){
      navigate("/");
    };

    getPendingRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        <div className="admin-header">
          <h1>Administrator Panel</h1>
          <h2>Resources Pending Approval:</h2> 
        </div>
        {error && error}
        {data && <PendingRequests data={data} acceptRequest={acceptRequest} declineRequest={declineRequest}/>}
      </div>
    </div>
  );
}

export default AdminPanel;
