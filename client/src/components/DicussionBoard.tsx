import TextField from "@mui/material/TextField";
import axios from "axios";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Data, CommentData } from "../@types/data";
import AddCommentIcon from '@mui/icons-material/AddComment';
import { InputAdornment } from "@mui/material";
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext";
import DeleteIcon from '@mui/icons-material/Delete';
import { url, axiosConfig } from "../axiosConfig";
import websiteIcon from "../assets/web.png";

const DiscussionBoard = () => {
  const params = useParams();
  const paramsResourceId = params.resourceId;
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const [resource, setResource] = useState<Data>({
    id: "",
    title: "",
    url: "",
    description: "",
    image: "",
    category: "",
    submitted_by: "",
    approval_pending: 0,
    firstName: ""
  });
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentForm, setCommentForm] = useState({
    content: "",
    time: "",
    resourceId: "",
    userId: ""
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const resourceId = location.state?.resourceId;
  const navigate = useNavigate();

  const updateBrowserUrl = (resourceId: string) => {
    const currentUrl = window.location.protocol + "//" + window.location.host;
    window.history.replaceState({path:currentUrl},"", `/discussion/${resourceId}`);
  };

  const getResource = async (resourceId: string) => {
    try {
      const response = await axios.get(`${url}/fetch-resource/${resourceId}`, axiosConfig)

      if (response.status === 200 && response.data[0]) {
        setResource(response.data[0]);
        updateBrowserUrl(resourceId);
        getComments();
      }
    } catch (error) {
      console.log(error);
    };
  };

  const getComments = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${url}/fetch-comments/${resourceId}`, axiosConfig)

      if(response.data && response.data.length === 0){
        console.log("There were no comments found in the database");
      } else if (response.status === 200) {
        setComments(response.data)
      };
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    };
  };

  const submitComment = async () => {
    if(!user.id) {
      return;
    }

    if(commentForm.content === "") {
      alert("Please write some content before submitting");
      return;
    };

    try {
      const response = await axios.post(`${url}/submit-comment`, commentForm , axiosConfig)

      if(response.status === 200) {
        setCommentForm({
          content: "",
          time: "",
          resourceId: "",
          userId: ""
        });
        getComments();
      };
    } catch (error) {
      console.log(error);
    };
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    setCommentForm({
      content: event.target.value,
      time: currentTime,
      resourceId: resourceId,
      userId: user.id
    });
  };

  const handleClick = async (commentId: string, userId: string) => {
    const userRole = user.role;
    
    try {
      const response = await axios.delete(`${url}/delete-comment/${commentId}/${userId}/${userRole}` , axiosConfig)

      if(response.status === 200) {
        setComments((prev) => prev.filter((item) => {
          return item.id !== commentId
        }))
      };
    } catch (error) {
      console.log(error);
    };
  };

  const deleteResource = async (id: string) => {
    try {
        await axios.delete(`${url}/delete-resource/${id}`, axiosConfig)
    } catch (error) {
      console.log(error);
    } finally {
        return navigate("/")
    }
  };

  const handleError = ( currentTarget: EventTarget & HTMLImageElement ) => {
    currentTarget.onerror = null
    currentTarget.src = websiteIcon
  };

  useEffect(() => {
    let finalQuery = resourceId;

    if (paramsResourceId) {
        finalQuery = paramsResourceId;
    };

    getResource(finalQuery);

    if(resource) {
      setResource(resource);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [resourceId, paramsResourceId]);

return (
  <div className="main-content">
    <div className="container">
      <div className="card" key={resource.id}>
        <div className="media-content">
          <h2><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a></h2>
          <a className="website-link" href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a>
          <p>{resource.description && resource.description.slice(0, 141)}...</p>
          <span>Category: {resource.category} · </span><span>Submitted By: {resource.firstName}</span>
          {user.role === "Admin" && <><span> · </span><button onClick={() => deleteResource(resource.id)}>Delete</button></>}
        </div>
        <div className="resource-img">
          <a href={resource.url} target="_blank" rel="noreferrer">
              <img 
              src={resource.image} 
              alt={""} 
              onError={({ currentTarget }) => handleError(currentTarget)}/>
          </a>
        </div>
      </div>
      <div className="comment-section">
        <form className="comment-form">
        {user.id && <p className="user-firstname">Comment as {user.firstName}:</p>}
          <TextField
            className="comment-draft"
            id="outlined-multiline-static"
            value={commentForm.content}
            onChange={(e) => handleChange(e)}
            multiline
            disabled={!user.id ? true : false}
            rows={4}
            placeholder={user.id ? "What are your thoughts?" : "Login to comment"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <AddCommentIcon onClick={() => submitComment()}/>
                </InputAdornment>
              )
            }}
          />
        </form>
        {loading && <div className="loading-text">Loading...</div>}
        {comments.length ? comments.map( comment => {
        return(
          <div className="comment-card" key={comment.id}>
            <div className="comment-contents">
              <h4>{comment.first_name}</h4>
              <p>{comment.content}</p>
              <span className="comment-datetime">{new Date(comment.time + "Z").toLocaleString("en-US", {
                localeMatcher: "best fit",
                timeZoneName: "short"
                } )} </span>
              <div className="delete-btn">
                {(user.id === comment.user_id || user.role ==="Admin") && <button onClick={() => handleClick(comment.id, comment.user_id)}>· Delete <DeleteIcon /></button>}
              </div>
            </div>
          </div>
        )
        }) :
          <p className="comment-status">There are no comments as of yet...</p>}
      </div>
    </div>
  </div>
  );    
};

export default DiscussionBoard;
