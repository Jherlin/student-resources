import { SearchResultsProps } from "../@types/data";
import ChatIcon from '@mui/icons-material/Chat';
import { Link } from "react-router-dom";
import websiteIcon from "../assets/web.png";
 
const SearchResults = ( { searchResults }: SearchResultsProps) => {

  const handleError = ( currentTarget: EventTarget & HTMLImageElement ) => {
    currentTarget.onerror = null
    currentTarget.src = websiteIcon
  };

  return (
    <>
      {searchResults && searchResults.map( item => {
        return(
          <div className="card" key={item.id}>
            <div className="media-content">
              <h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2>
              <a className="website-link" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
              <p>{item.description.slice(0, 141)}...</p>
              <span>Category: {item.category} · </span>
              <span className="discussion-btn">
                <Link to="/discussion" state={{ resourceId: item.id }}>Discussion </Link><ChatIcon />
              </span>
            </div>
            <div className="resource-img">
              <a href={item.url} target="_blank" rel="noreferrer">
                <img 
                src={item.image} 
                alt={""} 
                onError={({ currentTarget }) => handleError(currentTarget)}/>
              </a>
            </div>
          </div>
        )
      })}
    </>
  );
}

export default SearchResults;
