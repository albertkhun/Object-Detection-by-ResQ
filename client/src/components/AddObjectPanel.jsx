import { useState } from "react";
import axios from "axios";

export default function AddObjectPanel() {
  const [label, setLabel] = useState("");

  const addObject = async () => {
    await axios.post("http://localhost:5000/api/add-object", { label });
    alert("Object added!");
    setLabel("");
  };

  return (
    <div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Enter new object"
      />
      <button onClick={addObject}>Add Object</button>
    </div>
  );
}