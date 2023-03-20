export let axiosConfig = {
  withCredentials: true,
  headers : {}
};

if (process.env.NODE_ENV === "development") {
  axiosConfig = {
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': '*',
    }
  }
};

export let url = ""

if (process.env.NODE_ENV === "development") {
  url = "http://localhost:3000"
};
