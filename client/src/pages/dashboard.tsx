import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
function dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://localhost:3000/check-login", { withCredentials: true })
      .then((res) => {
        if (!res.data.loggedIn) {
          navigate("/login");
        }
      });
  }, []);

  return <h1>Hi dashboard</h1>;
}
export default dashboard;
