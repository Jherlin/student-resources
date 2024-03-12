import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchResults from "./SearchResults";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useAxios } from "../useAxios";
import Categories from "./Categories";
import { Data } from "../@types/data";
import { url, axiosConfig } from "../axiosConfig";

const SearchResources = () => {
  const params = useParams();
  const searchParams = params.searchQuery;
  const [searchResults, setSearchResults] = useState<Data[] | []>([]);
  const [axiosParams, setAxiosParams] = useState({
    skipPages: 0,
    loadMore: false,
    query: "",
    finalQuery: "",
    route: "/search-resources",
    category: ""
  });

  const { response } = useAxios({
    method: "POST",
    url: `${url}${axiosParams.route}`, axiosConfig,
    data: {
      searchQuery : axiosParams.finalQuery, 
      offset: axiosParams.skipPages
    }
    },
    {loadStatus: axiosParams.loadMore});
  
  let numberOfPages = 1;  

  if(searchResults.length > 25) {
    numberOfPages = Math.ceil(searchResults.length  / 25)
  };

  const getSearchResults = (event: FormEvent<HTMLFormElement>) => { 
    if(event){
      event.preventDefault();
    };

    if(axiosParams.query === "") {
      alert("Please enter a search query");
      return;
    };

    setAxiosParams({...axiosParams, route: "/search-resources", finalQuery: axiosParams.query})
    };

  const loadMoreResults = () => {
    if(searchResults.length < numberOfPages * 25) {
      alert("There are no more resources in the database");
      return;
    }
    
    if(axiosParams.category){
      loadMoreByCategory();
      return;
    }

    numberOfPages += 1;
    let paginationOffset = (numberOfPages - 1) * 25
    setAxiosParams({...axiosParams,route: "/search-resources", skipPages: paginationOffset, loadMore: true});
  };

  const searchCategory = (category: string) => {
    const offset = (numberOfPages - 1) * 25;

    setAxiosParams({
      ...axiosParams, 
      route: "/search-category",
      query: "",
      finalQuery: category,
      skipPages: offset, 
      loadMore: false});
  };

  const loadMoreByCategory = () => {
    numberOfPages += 1;
    const offset = (numberOfPages - 1) * 25;

    setAxiosParams({
      ...axiosParams, 
      route: "/search-category",
      finalQuery: axiosParams.category,
      skipPages: offset, 
      loadMore: true});
  };

  const refreshPage = () => {
    const homeUrl = window.location.protocol + "//" + window.location.host;

    if (searchResults.length) {
      setAxiosParams({...axiosParams, query: "", finalQuery: ""})
      setSearchResults([])
      window.history.replaceState({path:homeUrl},"", "/")
    };
  };

  useEffect(() => {
    if (searchParams) {
      setAxiosParams({
        ...axiosParams, 
        finalQuery: searchParams
      })
    };
    
    if (response.length) {
      setSearchResults(response);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, searchParams]);
  
  return (
    <div className="main-content">
      <div className="container">
        <form 
        onSubmit={(e) => getSearchResults(e)} 
        className={!searchResults.length ? "search-form" : "search-form move-search-form"}>
          <h1 className="homepage-title">Student Resources</h1>
          <TextField
          autoComplete="off"
          className="search-bar" 
          margin="normal"
          size="small"
          label="Search" 
          variant="outlined"
          value={axiosParams.query} 
          onChange={(e)=> setAxiosParams({...axiosParams, query: e.target.value})}
          type="text"/>
          <div className="search-bar-btns">
            <Button 
            type="submit"
            className="search-btn" 
            variant="contained" 
            size="medium">Search</Button>
            <Button 
            className="home-btn"
            variant="contained"
            onClick={refreshPage}
            sx={{display: searchResults.length ? "inline" : "none"}}
            size="medium">{"Back To Home"}</Button>
          </div>
        </form>
          {!searchResults.length &&
          <div className={"categories-container"}>
            <Categories searchCategory={searchCategory} axiosParams={axiosParams} setAxiosParams={setAxiosParams}/>
          </div>}
          <div className={!searchResults.length ? "search-results" : "search-results show-search-results"}>
            <SearchResults searchResults={searchResults} />
          </div>
          <div className="loadingSection">
            {/* {loading && <><span>Loading...</span><br/><br/></>} */}
            {searchResults.length >= 25 && <Button variant="contained" size="small" onClick={() => loadMoreResults()}>Load more</Button>}
          </div>
      </div>
    </div>
  );
}

export default SearchResources;
