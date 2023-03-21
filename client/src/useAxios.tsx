import axios from "axios";
import { useEffect, useState } from "react";
import { Data } from "./@types/data";

export const useAxios = (axiosParams: any, pagination: any) => {
  const [response, setResponse] = useState<Data[] | []>([]);
  const [loading, setLoading] = useState(false);
  const controller = new AbortController();

  const updateBrowserUrl = () => {
    const currentUrl = window.location.protocol + "//" + window.location.host;
    window.history.replaceState({path:currentUrl},"", axiosParams.data.searchQuery ? `/search/${axiosParams.data.searchQuery}` : "");
  };

  const fetchData = async (params: any, pagination: any) => {
    setLoading(true);

    try {
      const response = await axios.request({...params, signal: controller.signal});

      if (response.data && response.data.length === 0){
        alert("There were no resources found in the database");
      } else if (pagination.loadStatus === true) {
        updateBrowserUrl();
        setResponse(prevState => {
        return [...prevState, ...response.data]})
      } else if(response.status === 200) {
        updateBrowserUrl();
        setResponse(response.data);
      };
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(axiosParams.data.searchQuery) {
      fetchData(axiosParams, pagination);
    };

    return () => {
      controller.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosParams.url, axiosParams.data.searchQuery, axiosParams.data.offset]);
  
  return { response, loading };
}
