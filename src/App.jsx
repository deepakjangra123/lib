import { useState, useEffect } from "react";
import "./App.css"; 
import { IoMdCloudDownload } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { AiOutlineEdit } from "react-icons/ai";

const BACKEND_URL = `statushttps://library-backend-alxn.onrender.com`

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [globalEdit, setGlobalEdit] = useState(false);
  const [globalFormData, setGlobalFormData] = useState({});
  const [editField, setEditField] = useState("PLACE");

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/data`);
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search function
  const handleSearch = () => {
    if (!searchQuery) {
      setResults([]);
      return;
    }
  
    let filteredResults = [];
  
    // If search query consists only of digits, check ACCESSION as a string
    if (searchQuery.match(/^\d+$/)) {
      const matchingAccession = data.find(
        (item) => item.ACCESSION === searchQuery
      );
      if (matchingAccession) {
        filteredResults.push(matchingAccession);
        const matchingTitle = matchingAccession.TITLE;
        const additionalMatches = data.filter(
          (item) => item.TITLE === matchingTitle && item.ACCESSION !== searchQuery
        );
        filteredResults.push(...additionalMatches);
      }
    } else {
      filteredResults = data.filter(
        (item) =>
          item.TITLE?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.NAME?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    setResults(filteredResults);
  };
  

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  // Handle edit click
  const handleEditClick = (item) => {
    setEditItem(item);
    setFormData({ ...item });
  };

  // Handle form changes
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission (individual item)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const updatedData = data.map((item) =>
      item.ACCESSION === formData.ACCESSION ? { ...item, ...formData } : item
    );

    setData(updatedData);
    setResults(updatedData);
    setEditItem(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to save data");
      console.log("Data successfully saved.");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Global edit handlers
  const handleGlobalFormChange = (e) => {
    setGlobalFormData({
      ...globalFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGlobalFormSubmit = async (e) => {
    e.preventDefault();

    if (!globalFormData[editField]) {
      alert("Please enter a value to update.");
      return;
    }

    const updatedData = data.map((item) => {
      if (results.some((result) => result.ACCESSION === item.ACCESSION)) {
        return {
          ...item,
          [editField]: globalFormData[editField] || item[editField],
        };
      }
      return item;
    });

    setData(updatedData);
    setResults(updatedData);
    setGlobalEdit(false);

    try {
      await fetch(`${BACKEND_URL}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  const handleDownload = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/download`);
  
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
  
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "library_data.json"; // Change file name if needed
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  

  return (
    <div className="App">
      <h1 className="searchbartop">📚 Library Search</h1>

      
      {globalEdit && (
        <div className="global-edit-form">
          <h2>Global ✏️ Edit</h2>
          <form onSubmit={handleGlobalFormSubmit}>
            <label>
              Select Field:
              <select
                onChange={(e) => setEditField(e.target.value)}
                value={editField}
              >
                <option value="PLACE">Place</option>
                <option value="TITLE">Title</option>
                <option value="DEPT">Department</option>
                <option value="NAME">Name</option>
              </select>
            </label>
            <label>
              New Value:
              <input
                type="text"
                name={editField}
                value={globalFormData[editField] || ""}
                onChange={handleGlobalFormChange}
              />
            </label>
            <button type="submit">Apply Changes</button>
            <button type="button" onClick={() => setGlobalEdit(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="🔍 Search by ACCESSION, TITLE, or NAME"
        />
       
      </div>
      <div className="buttons_below">
  <button onClick={handleDownload}>
    <IoMdCloudDownload /> Download
  </button>
  <button
    className={globalEdit ? "active-global" : ""}
    onClick={() => setGlobalEdit(!globalEdit)}
  >
    <AiOutlineEdit /> {globalEdit ? "Cancel Global Edit" : "Edit"}
  </button>
</div>
      

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {editItem && (
            <div className="edit-form">
              <h2>✏️ Edit</h2>
              <form onSubmit={handleFormSubmit}>
                <label>
                  TITLE:
                  <input
                    type="text"
                    name="TITLE"
                    value={formData.TITLE || ""}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  NAME:
                  <input
                    type="text"
                    name="NAME"
                    value={formData.NAME || ""}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  ACCESSION:
                  <input
                    type="number"
                    name="ACCESSION"
                    value={formData.ACCESSION || ""}
                    onChange={handleFormChange}
                    readOnly
                  />
                </label>
                <label>
                  PLACE:
                  <input
                    type="text"
                    name="PLACE"
                    value={formData.PLACE || ""}
                    onChange={handleFormChange}
                  />
                </label>
                <label>
                  PLACE:
                  <input
                    type="text"
                    name="DEPT"
                    value={formData.DEPT || ""}
                    onChange={handleFormChange}
                  />
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditItem(null)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {results.length > 0 ? (
            <ul>
              {results.map((item, index) => (
                <li key={index}>
                  <div className="card_content"> <h2>{item.TITLE}</h2>
                  <h3>{item.NAME}</h3>
                  <h3>{item.DEPT}</h3>
                  <p>
                    <strong>ACCESSION:</strong> {item.ACCESSION}
                  </p>
                  <p>
                    <strong>Place:</strong>{" "}
                    {item.PLACE ? item.PLACE : "No place available"}
                  </p></div>
                  <div className="card_edit_button"> <button onClick={() => handleEditClick(item)}><FiEdit /></button></div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
