import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// List of all countries (you might want to import this from a separate file)
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea, North",
  "Korea, South",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

function CreateProject() {
  const [project_name, setProjectName] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [status, setStatus] = useState<"ongoing" | "complete">("ongoing");
  const [draft, setDraft] = useState(false);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [country, setCountry] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (project_name.length < 4) {
      alert("Project name must be at least 4 characters long");
      return;
    }

    if (!start_date) {
      alert("Start date is required");
      return;
    }

    if (status === "complete" && !end_date) {
      alert("End date is required for completed projects");
      return;
    }

    if (!address || !description || !client || !country) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("project_name", project_name);
    formData.append("start_date", start_date);
    formData.append("end_date", end_date || "");
    formData.append("status", status);
    formData.append("draft", draft.toString());
    formData.append("address", address);
    formData.append("description", description);
    formData.append("client", client);
    formData.append("country", country);
    files.forEach((file) => formData.append("images", file));

    axios
      .post("http://localhost:3000/createProject", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Project created:", response.data);
        // Optionally redirect or show success message
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };

  // Handle year-only inputs (convert to full date)
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setStartDate(`${year}-01-01`); // Set to January 1st of the year
    } else {
      setStartDate(year);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setEndDate(`${year}-12-31`); // Set to December 31st of the year
    } else {
      setEndDate(year);
    }
  };

  return (
    <>
      <h1>Create Project</h1>
      <main>
        <form onSubmit={handleCreate}>
          <fieldset>
            <legend>Create new project</legend>

            <label htmlFor="project_name">
              <small>Project Name (min. 4 characters)</small>
              <input
                id="project_name"
                name="project_name"
                type="text"
                value={project_name}
                onChange={(e) => setProjectName(e.target.value)}
                autoComplete="off"
                minLength={4}
                required
              />
            </label>

            <label htmlFor="start_date">
              <small>Start Year (required)</small>
              <input
                id="start_date"
                name="start_date"
                type="number"
                min="1900"
                max="2100"
                value={start_date ? start_date.split("-")[0] : ""}
                onChange={handleStartDateChange}
                required
              />
            </label>

            <label htmlFor="end_date">
              <small>End Year (required for completed projects)</small>
              <input
                id="end_date"
                name="end_date"
                type="number"
                min="1900"
                max="2100"
                value={end_date ? end_date.split("-")[0] : ""}
                onChange={handleEndDateChange}
              />
            </label>

            <label htmlFor="status">
              <small>Status</small>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "ongoing" | "complete")
                }
              >
                <option value="ongoing">Ongoing</option>
                <option value="complete">Complete</option>
              </select>
            </label>

            <label htmlFor="draft">
              <small>Draft</small>
              <input
                id="draft"
                name="draft"
                type="checkbox"
                checked={draft}
                onChange={(e) => setDraft(e.target.checked)}
              />
            </label>

            <label htmlFor="address">
              <small>Address (required)</small>
              <input
                id="address"
                name="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="off"
                required
              />
            </label>

            <label htmlFor="description">
              <small>Description (required)</small>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                name="description"
                autoComplete="off"
                required
              ></textarea>
            </label>

            <label htmlFor="client">
              <small>Client (required)</small>
              <input
                id="client"
                name="client"
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                autoComplete="off"
                required
              />
            </label>

            <label htmlFor="country">
              <small>Country (required)</small>
              <select
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <br />
            <label htmlFor="images">
              <small>Upload images</small>
              <input
                type="file"
                name="images"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>
            <button type="submit">Create</button>
          </fieldset>
        </form>
      </main>
    </>
  );
}

export default CreateProject;
