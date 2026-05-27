import { useState } from "react";

import api from "../api/axios";

import AdminNavbar from "../components/AdminNavbar";

function Admin() {
  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);

      formData.append("price", price);

      formData.append("image", image);

      await api.post("/items", formData);

      alert("Item Added");

      setName("");

      setPrice("");

      setImage(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div>
        <h1>ADMIN PANEL</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <br />
          <br />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <br />
          <br />

          <input type="file" onChange={(e) => setImage(e.target.files[0])} />

          <br />
          <br />

          <button type="submit">Add Item</button>
        </form>
      </div>
    </>
  );
}

export default Admin;
