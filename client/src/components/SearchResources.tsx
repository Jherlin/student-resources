import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchResults from "./SearchResults";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useAxios } from "../useAxios";
import Categories from "./Categories";
import { Data } from "../@types/data";
import axios from "axios";

const SearchResources = () => {
  const params = useParams();
  const searchParams = params.searchQuery;
  const [searchResults, setSearchResults] = useState<Data[] | []>([]);
  const [skipPages, setSkipPages] = useState(0);
  const [loadMore, setLoadMore] = useState(false);
  const [finalQuery, setFinalQuery] = useState("");
  const [query, setQuery] = useState(searchParams ? searchParams : "");
  const { response, loading } = useAxios({
    method: "POST",
    url: `${process.env.REACT_APP_BASE_URL}/search-resources`,
    withCredentials: true,
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
    data: {
      searchQuery : finalQuery, 
      offset: skipPages
    }
    },
    {loadStatus: loadMore});
  
  let numberOfPages = 1;

  if(searchResults.length > 25) {
    numberOfPages = Math.ceil(searchResults.length  / 25)
  };

  const getSearchResults = (query: string, event: FormEvent<HTMLFormElement> | null) => {
    if(event){
      event.preventDefault();
    };

    if(query === "") {
      alert("Please enter a search query");
      return;
    };
    
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({path:newUrl},'', query ? query : "");

    setFinalQuery(query);
    };

  const loadMoreResults = () => {
    if (searchResults.length < numberOfPages * 25) {
      alert("There are no more resources in the database");
      return;
    }
    
    numberOfPages += 1;
    let paginationOffset = (numberOfPages - 1) * 25
    setSkipPages(paginationOffset);
    setLoadMore(true);
  };

  const searchCategory = (category: string) => {
    console.log("Searching by category");

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/search-category/${category}`, {
        withCredentials: true,
        headers: {
        "Access-Control-Allow-Origin": "*",
        }
      })
      .then(response => {
        setSearchResults(response.data);
      })
      .catch(error => {
        console.log(error);
      })
  };

  useEffect(() => {
    if (response.length) {
      setSearchResults(response);
    }
}, [response]);
  
  return (
    <div className="main-content">
      <div className="container">
        <form 
        onSubmit={(e) => getSearchResults(query, e)} 
        className={!searchResults.length ? "search-form" : "search-form move-search-form"}>
          <h1>Student Resources</h1>
          <TextField
          autoComplete="off"
          className="search-bar" 
          margin="normal"
          size="small"
          label="Search" 
          variant="outlined"
          value={query} 
          onChange={(e)=>setQuery(e.target.value)}
          type="text"/>
          <div className="search-bar-btns">
            <Button 
            onClick={() => getSearchResults(query, null)}
            className="search-btn" 
            variant="contained" 
            size="medium">Search</Button>
            <Button className="category-btn"variant="contained" size="medium">Categories</Button>
          </div>
        </form>
          {!searchResults.length &&
          <div className="categories-container">
            <Categories searchCategory={searchCategory}/>
          </div>}
          <div className={!searchResults.length || (loading && !skipPages) ? "search-results" : "search-results show-search-results"}>
            <SearchResults searchResults={searchResults} />
          </div>
          {loading && <><span>Loading...</span><br/><br/></>}
          {searchResults.length >= 25 && <Button variant="contained" size="small" onClick={() => loadMoreResults()}>Load more</Button>}
      </div>
    </div>
  );
}

export default SearchResources;
