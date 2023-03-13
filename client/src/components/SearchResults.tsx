import { SearchResultsProps } from "../@types/data";

const SearchResults = ( { searchResults }: SearchResultsProps) => {
  return (
    <>
      {searchResults && searchResults.map( item => {
        return(
          <div className="card" key={item.id}>
            <div className="media-content">
              <h2><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h2>
              <a className="website-link" href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
              <p>{item.description.slice(0, 141)}...</p>
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

export default SearchResults;
