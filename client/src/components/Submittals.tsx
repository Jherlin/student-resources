import axios from "axios";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { User, UserContextType } from "../@types/user";
import GlobalContext from "../providers/GlobalContext"

const Submittals = () => {
  const globalContext = useContext(GlobalContext) as UserContextType;
  const user = globalContext.user as User;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "Other",
    submittedBy: user.id,
    approvalPending: true
    });
  const [error, setError] = useState<string | undefined>();

  const onSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    setLoading(true);
    axios
        .post(`${process.env.REACT_APP_BASE_URL}/submit-resource`, formData, {
            withCredentials: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        })
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
                setFormData({
                  title: "",
                  url: "",
                  category: "Other",
                  submittedBy: user.id,
                  approvalPending: true
                  });
            }
        })
        .catch((error) => {
          setError(error.response.data);
          setFormData({
            title: "",
            url: "",
            category: "Other",
            submittedBy: user.id,
            approvalPending: true
            });
        })
        .finally(() => {
          setLoading(false)
        });
    };

  useEffect(() => {
    if (!user.id){
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-submittal">
        <h1 className="title">Submit a Resource</h1>
        {error && error}
        <form onSubmit={(e)=> {onSubmitForm(e)}}>
          <label>Link:</label>
          <input
              type="text"
              name="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <label>Category:</label>
          <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value})}
          >
            <option value="Web Development">Web Development</option>
            <option value="Database">Database</option>
            <option value="YouTube Content">YouTube Content</option>
            <option value="Educational Courses">Educational Courses</option>
            <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
            <option value="Other">Other</option>
          </select>
          <button>Submit</button>
        </form>
        {loading && <span>Loading...</span>}
    </div>
  );
};

export default Submittals;
