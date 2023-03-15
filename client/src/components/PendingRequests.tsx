import { DataProps } from "../@types/data";

const PendingRequests = ({ data, acceptRequest, declineRequest }: DataProps)=> {
  return (
    <>
      {data && data.map( item => {
        return(
          <div className="card" key={item.id}>
            <div className="media-content">
              <h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2>
              <a className="website-link" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
              <p>{item.description.slice(0, 141)}...</p>
              <span>Category: {item.category}</span>            
              <div className="approval-btn">
                <button onClick={() => acceptRequest(item.id)}>Approve</button>
                <button onClick={() => declineRequest(item.id)}>Decline</button>
              </div>
            </div>
            <div className="resource-img">
              <a href={item.url} target="_blank" rel="noreferrer"><img src={item.image} alt={""}/></a>
            </div>
          </div>
          )
        })}
    </>
  );
}

export default PendingRequests;
