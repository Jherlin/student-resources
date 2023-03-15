import TextField from "@mui/material/TextField";
import axios from "axios";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Data, CommentData } from "../@types/data";
import AddCommentIcon from '@mui/icons-material/AddComment';
import { InputAdornment } from "@mui/material";
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext";

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
    approval_pending: 0
  });
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentForm, setCommentForm] = useState({
    content: "",
    time: "",
    resourceId: "",
    userId: ""
  });

  const location = useLocation();
  const { resourceId } = location.state;
  
  const getResource = () => {
    axios
    .get(`${process.env.REACT_APP_BASE_URL}/fetch-resource/${resourceId}`,{
      withCredentials: true,
      headers: {
      "Access-Control-Allow-Origin": "*",
      }
    })
    .then(response => {
      setResource(response.data[0]);
      getComments();
    })
    .catch(error => {
      console.log(error);
    })
  }

  const getComments = () => {
    axios
    .get(`${process.env.REACT_APP_BASE_URL}/fetch-comments/${resourceId}`,{
      withCredentials: true,
      headers: {
      "Access-Control-Allow-Origin": "*",
      }
    })
    .then(response => {
      if(response.data && response.data.length === 0){
        console.log("There were no comments found in the database");
      } else {
        setComments(response.data)
      }
    })
    .catch(error => {
      console.log(error);
    })
  }

  const submitComment = () => {
    if(!user.id) {
      return;
    }

    if(commentForm.content === "") {
      alert("Please write some content before submitting");
      return;
    };
  
    console.log(commentForm);
    axios
    .post(`${process.env.REACT_APP_BASE_URL}/submit-comment`, commentForm ,{
      withCredentials: true,
      headers: {
      "Access-Control-Allow-Origin": "*",
      }
    })
    .then(response => {
      if(response.status === 200) {
        setCommentForm({
          content: "",
          time: "",
          resourceId: "",
          userId: ""
        });
        getComments();
      };
    })
    .catch(error => {
      console.log(error);
    })
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    setCommentForm({
      content: event.target.value,
      time: currentTime,
      resourceId: resourceId,
      userId: user.id
    });
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
          <span>Category: {resource.category}</span>
        </div>
        <div className="resource-img">
          <a href={resource.url} target="_blank" rel="noreferrer"><img src={resource.image} alt={""}/></a>
        </div>
      </div>
      <div className="comment-section">
        <form className="comment-form">
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
        {comments.length ? comments.map( comment => {
        return(
          <div className="comment-card" key={comment.id}>
            <div className="comment-contents">
              <h4>{comment.first_name}</h4>
              <p>{comment.content}</p>
              <span>{new Date(comment.time + "Z").toLocaleString("en-US", {
                localeMatcher: "best fit",
                timeZoneName: "short"
                })}
              </span>
            </div>
          </div>
        )
        }) :
          <p>There are no comments as of yet...</p>}
      </div>
    </div>
  </div>
  );    
};

export default DiscussionBoard;
