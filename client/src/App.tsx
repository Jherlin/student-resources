import { Route, Routes } from "react-router-dom";
import NotFound from "./components/NotFound";
import Header from "./components/Header";
import GlobalContextProvider from "./providers/GlobalContextProvider";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Submittals from "./components/Submittals";
import AdminPanel from "./components/AdminPanel";
import SearchResources from "./components/SearchResources";
import DiscussionBoard from "./components/DicussionBoard";

function App() {
  return (
      <div className="App">
        <GlobalContextProvider>
          <Header />
          <Routes>
            <Route path="/"> 
              <Route index element={<SearchResources />}/> 
              <Route path="/search/:searchQuery" element={<SearchResources />}/>
            </Route> 
            <Route path="/register" element={<Register />}/> 
            <Route path="/login" element={<Login />}/> 
            <Route path="/dashboard" element={<Dashboard />}/> 
            <Route path="/submittals" element={<Submittals />}/> 
            <Route path="/admin" element={<AdminPanel />}/> 
            <Route path="/discussion" element={<DiscussionBoard />}/> 
            <Route path="*" element={<NotFound />}/> 
          </Routes>
        </GlobalContextProvider>
      </div>
  );
};

export default App;
