import axios, { AxiosError } from "axios";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from "@mui/material/FormControl";
import { url, axiosConfig } from "../axiosConfig";

const Submittals = () => {
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "Other",
    submittedBy: user.id,
    approvalPending: true
    });
  const [error, setError] = useState<string>("");

  const onSubmitForm = async (e: FormEvent<HTMLFormElement> | FormEvent<HTMLDivElement>) => {
    e.preventDefault();

    setFormData({
      title: "",
      url: "",
      category: "Other",
      submittedBy: user.id,
      approvalPending: true
      });

    try {
      await axios.post(`${url}/submit-resource`, formData, axiosConfig)
    } catch (error) {
      const err = error as AxiosError;
      setError(err.response?.data as string);
      }
    };

  useEffect(() => {
    if (!user.id){
      navigate("/login", { 
        state: { 
          route: "/submittals"
        }});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main-content">
      <div className="container">
        <div className="page-submittal">
            <h1 className="form-title">Submit a Resource</h1>
            <div className="form-error">{error && error}</div>
            <form className="resource-form"onSubmit={e => onSubmitForm(e)}>
              <TextField
                required
                autoComplete="off"
                label="Link"
                variant="filled"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              <FormControl
                onSubmit={(e)=> {onSubmitForm(e)}} 
                variant="filled" 
                >
                <InputLabel id="demo-simple-select-filled-label">Category</InputLabel>
                <Select
                  labelId="demo-simple-select-filled-label"
                  id="demo-simple-select-filled"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value})}
                >
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Database">Database</MenuItem>
                  <MenuItem value="YouTube Content">YouTube Content</MenuItem>
                  <MenuItem value="Educational Courses">Educational Courses</MenuItem>
                  <MenuItem value="Data Structures & Algorithms">Data Structures & Algorithms</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <Button type="submit" variant="contained">Submit</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Submittals;
