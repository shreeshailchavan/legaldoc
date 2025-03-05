import { createContext, useState, useContext } from "react";

const ResultContext = createContext();

export const ResultProvider = ({ children }) => {
  const [results, setResults] = useState({}); // Store multiple results mapped by file_id

  const saveResult = (fileId, data) => {
    console.log("Saving result for file_id:", fileId);
    console.log("Data to save:", data);
    setResults((prevResults) => ({
      ...prevResults,
      [fileId]: data, // Store the entire response object
    }));
  };

  return (
    <ResultContext.Provider value={{ results, saveResult }}>
      {children}
    </ResultContext.Provider>
  );
};

export const useResult = () => useContext(ResultContext);