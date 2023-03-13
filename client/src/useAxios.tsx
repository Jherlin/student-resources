import axios from "axios";
import { useEffect, useState } from "react";
import { Data } from "./@types/data";

export const useAxios = (axiosParams: any, pagination: any) => {
  const [response, setResponse] = useState<Data[] | []>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const controller = new AbortController();

  const fetchData = (params: any, pagination: any) => {
    setLoading(true);
    axios.request({...params, signal: controller.signal})
    .then((response) => {
        if(response.data && response.data.length === 0){
          alert("There were no resources found in the database");
        } else if (pagination.loadStatus === true) {
          setResponse(prevState => {
          return [...prevState, ...response.data]})
        } else if(response.status === 200) {
          setResponse(response.data);
        };
    })
    .catch((error) => {
      setError(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  };

  useEffect(() => {
    console.log("useAxios");
    if(axiosParams.data.searchQuery) {
      fetchData(axiosParams, pagination);
    };

    return () => {
      controller.abort();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosParams.data.searchQuery, axiosParams.data.offset]);
  
  return { response, error, loading };
}
