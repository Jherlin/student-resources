import TextField from "@mui/material/TextField";
import axios from "axios";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Data, CommentData } from "../@types/data";
import AddCommentIcon from '@mui/icons-material/AddComment';
import { InputAdornment } from "@mui/material";
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext";
import DeleteIcon from '@mui/icons-material/Delete';

const DiscussionBoard = () => {
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
  const { resourceId } = location.state;
  
  const getResource = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fetch-resource/${resourceId}`,{
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })

      if (response.status === 200) {
        setResource(response.data[0]);
        getComments();
      }
    } catch (error) {
      console.log(error);
    };
  };

  const getComments = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fetch-comments/${resourceId}`,{
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })

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
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/submit-comment`, commentForm ,{
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })

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
    try {
      const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/delete-comment/${commentId}/${userId}` ,{
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })

      if(response.status === 200) {
        setComments((prev) => prev.filter((item) => {
          return item.id !== commentId
        }))
      };
    } catch (error) {
      console.log(error);
    };
  };

  useEffect(() => {
    getResource();

    if(resource) {
      setResource(resource);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

return (
  <div className="main-content">
    <div className="container">
      <div className="card" key={resource.id}>
        <div className="media-content">
          <h2><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a></h2>
          <a className="website-link" href={resource.url} target="_blank" rel="noreferrer">{resource.url}</a>
          <p>{resource.description && resource.description.slice(0, 141)}...</p>
          <span>Category: {resource.category} · </span><span>Submitted By: {resource.firstName}</span>
        </div>
        <div className="resource-img">
          <a href={resource.url} target="_blank" rel="noreferrer"><img src={resource.image} alt={""}/></a>
        </div>
      </div>
      <div className="comment-section">
        <form className="comment-form">
        {user.id && <p className="user-firstname">Comment as {user.firstName}</p>}
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
                {user.id === comment.user_id && <button onClick={() => handleClick(comment.id, comment.user_id)}>· Delete <DeleteIcon /></button>}
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
