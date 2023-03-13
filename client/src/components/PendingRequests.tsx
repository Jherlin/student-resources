import { DataProps } from "../@types/data";

const PendingRequests = ({ data, acceptRequest, declineRequest }: DataProps)=> {
  return (
    <div>
      <br/>
      <h2>Resources Pending Approval:</h2>
      <br/>
      {data && data.map( item => {
        return(
          <div key={item.id} style={{width: "400px"}}>
            <br />
            <h3>{item.title}</h3>
            <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
            <p>{item.description}</p>
            <img src={item.image} alt={item.description} style={{width: "200px"}}/>
            <br />
            <button onClick={() => acceptRequest(item.id)}>Approve</button>
            <button onClick={() => declineRequest(item.id)}>Decline</button>
            <br />
          </div>
        )
      })}
    </div>
  );
}

export default PendingRequests;
