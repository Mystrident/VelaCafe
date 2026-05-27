import { useEffect, useState } from "react";

import api from "../api/axios";

import AdminNavbar from "../components/AdminNavbar";

function Admin() {
  const [name, setName] = useState("");

  const [price, setPrice] = useState("");

  const [image, setImage] = useState(null);

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");

      setItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);

      formData.append("price", price);

      formData.append("image", image);

      await api.post("/api/items", formData);

      alert("Item Added");

      setName("");

      setPrice("");

      setImage(null);

      fetchItems();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const confirmDelete = window.confirm("Delete this item?");

      if (!confirmDelete) return;

      await api.delete(`/api/items/${id}`);

      alert("Item Deleted");

      fetchItems();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1
          className="
            text-4xl
            font-black
            text-[#4b1e14]
            mb-10
          "
        >
          ADMIN PANEL
        </h1>

        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            p-8
            rounded-3xl
            shadow-lg
            mb-14
          "
        >
          <div className="grid md:grid-cols-3 gap-5">
            <input
              type="text"
              placeholder="Item Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                border
                p-4
                rounded-2xl
              "
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="
                border
                p-4
                rounded-2xl
              "
              required
            />

            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="
                border
                p-4
                rounded-2xl
              "
              required
            />
          </div>

          <button
            type="submit"
            className="
              mt-6
              bg-orange-500
              text-white
              px-8
              py-4
              rounded-2xl
              font-bold
            "
          >
            Add Item
          </button>
        </form>

        <h2
          className="
            text-3xl
            font-bold
            mb-8
            text-[#4b1e14]
          "
        >
          All Food Items
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-8
          "
        >
          {items.map((item) => (
            <div
              key={item._id}
              className="
                bg-white
                rounded-3xl
                shadow-lg
                overflow-hidden
              "
            >
              <img
                src={item.image}
                alt={item.name}
                className="
                  w-full
                  h-56
                  object-cover
                "
              />

              <div className="p-5">
                <h3
                  className="
                    text-2xl
                    font-bold
                    text-[#4b1e14]
                  "
                >
                  {item.name}
                </h3>

                <p
                  className="
                    text-orange-500
                    font-bold
                    mt-2
                  "
                >
                  ₹{item.price}
                </p>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="
                    mt-5
                    bg-red-500
                    text-white
                    px-5
                    py-3
                    rounded-2xl
                    w-full
                    font-bold
                  "
                >
                  Delete Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Admin;
