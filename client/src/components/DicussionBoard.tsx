import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Data, CommentData } from "../@types/data";

const DiscussionBoard = () => {
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
      console.log(response.data[0]);
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
        console.log(response.data)
        setComments(response.data)
      }
    })
    .catch(error => {
      console.log(error);
    })
  }

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
      <>
      {comments.length ? comments.map( comment => {
        return(
          <div className="comment-card" key={comment.id}>
            <div className="comment-contents">
              <p>{comment.content}</p>
              <span>{comment.time}</span>
            </div>
          </div>
        )
      }) :
      <p>There are no comments as of yet...</p>}
      </>
    </div>
  </div>
  );    
};

export default DiscussionBoard;
