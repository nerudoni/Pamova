import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";

const COUNTRIES: string[] = [
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
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Côte d’Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia (Czech Republic)",
  "Democratic Republic of the Congo",
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
  "Eswatini (fmr. Swaziland)",
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
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
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
  "South Korea",
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
  "United States of America",
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
        alert("Project created successfully!");
        // Optionally redirect or clear form
      })
      .catch((error) => {
        console.error("Error creating project:", error);
        alert("Error creating project. Please try again.");
      });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setStartDate(`${year}-01-01`);
    } else {
      setStartDate(year);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = e.target.value;
    if (year && year.length === 4) {
      setEndDate(`${year}-12-31`);
    } else {
      setEndDate(year);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Create Project</h1>
      </header>
      <main className={styles.main}>
        <form onSubmit={handleCreate} className={styles.form}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Create new project</legend>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="project_name" className={styles.label}>
                  <span className={styles.required}>Project Name</span>
                  <small className={styles.small}>Minimum 4 characters</small>
                  <input
                    id="project_name"
                    name="project_name"
                    type="text"
                    value={project_name}
                    onChange={(e) => setProjectName(e.target.value)}
                    autoComplete="off"
                    minLength={4}
                    required
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="client" className={styles.label}>
                  <span className={styles.required}>Client</span>
                  <input
                    id="client"
                    name="client"
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    autoComplete="off"
                    required
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="start_date" className={styles.label}>
                  <span className={styles.required}>Start Year</span>
                  <input
                    id="start_date"
                    name="start_date"
                    type="number"
                    min="1900"
                    max="2100"
                    value={start_date ? start_date.split("-")[0] : ""}
                    onChange={handleStartDateChange}
                    required
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="end_date" className={styles.label}>
                  End Year
                  <small className={styles.small}>
                    Required for completed projects
                  </small>
                  <input
                    id="end_date"
                    name="end_date"
                    type="number"
                    min="1900"
                    max="2100"
                    value={end_date ? end_date.split("-")[0] : ""}
                    onChange={handleEndDateChange}
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>
                  Status
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ongoing" | "complete")
                    }
                    className={styles.select}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="complete">Complete</option>
                  </select>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.label}>
                  <span className={styles.required}>Country</span>
                  <select
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className={styles.select}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="address" className={styles.label}>
                  <span className={styles.required}>Address</span>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="off"
                    required
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="description" className={styles.label}>
                  <span className={styles.required}>Description</span>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    name="description"
                    autoComplete="off"
                    required
                    className={styles.textarea}
                  ></textarea>
                </label>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.checkboxContainer}>
                  <input
                    id="draft"
                    name="draft"
                    type="checkbox"
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <label htmlFor="draft" className={styles.checkboxLabel}>
                    Save as Draft
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="images" className={styles.label}>
                  Upload Images
                  <input
                    type="file"
                    name="images"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(Array.from(e.target.files));
                      }
                    }}
                    className={styles.fileInput}
                  />
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Create Project
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </div>
  );
}

export default CreateProject;
