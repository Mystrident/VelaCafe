import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import api from "../api/axios";
import AdminNavbar from "../components/AdminNavbar";
import Loader from "../components/Loader";

function Admin() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Beverages"); // NEW: Category State
  const [image, setImage] = useState(null);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchItems();
    
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));
    socket.on("stock-updated", ({ itemId, newStock }) => {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, stock: newStock } : item
        )
      );
    });
    return () => socket.disconnect();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/items");
      setItems(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category); // NEW: Sending Category to Backend
      formData.append("image", image);

      await api.post("/api/items", formData);
      alert("Item Added Successfully");
      
      // Reset Form
      setName("");
      setPrice("");
      setStock("");
      setCategory("Beverages"); // Reset Category
      setImage(null);
      document.getElementById("imageInput").value = "";
      
      fetchItems();
    } catch (error) {
      console.log(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Failed to add item.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this item?");
      if (!confirmDelete) return;
      await api.delete(`/api/items/${id}`);
      fetchItems();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStock = async (id, currentStock, itemName) => {
    const newStock = window.prompt(`Enter new stock quantity for ${itemName}:`, currentStock);
    if (newStock === null || newStock === "" || Number(newStock) === currentStock) return;
    try {
      await api.patch(`/api/items/${id}/stock`, { stock: Number(newStock) });
      fetchItems();
    } catch (error) {
      console.log(error);
      alert("Failed to update stock");
    }
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 mt-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <h2 className="text-2xl font-black mb-6 text-[#3a1710]">Add New Menu Item</h2>
          
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <input type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium" required />
              <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium" required />
              <input type="number" placeholder="Initial Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium" required />
              
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-medium text-gray-700" 
                required
              >
                <option value="Beverages">Beverages</option>
                <option value="Puffs">Puffs</option>
                <option value="Rolls">Rolls</option>
                <option value="Vadai">Vadai</option>
                <option value="Bajjis">Bajjis</option>
                <option value="Pizza & Burgers">Pizza & Burgers</option>
                <option value="Chips & Cutlets">Chips & Cutlets</option>
                <option value="Bakery & Desserts">Bakery & Desserts</option>
                <option value="Paneer">Paneer</option>
                <option value="Healthy & Groceries">Healthy & Groceries</option>
                <option value="Traditional Snacks">Traditional Snacks</option>
              </select>

              <input id="imageInput" type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl outline-none text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer" required />
            </div>
            
            <button type="submit" disabled={loading} className="mt-8 bg-[#3a1710] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg shadow-[#3a1710]/20 active:scale-[0.98] disabled:opacity-50">
              {loading ? "Adding Item..." : "+ Add Item to Menu"}
            </button>
          </form>
        </motion.div>

        <h2 className="text-2xl font-black mb-8 text-[#3a1710]">Current Menu</h2>
        
        {isFetching ? (
          <Loader />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {items.map((item) => (
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                key={item._id}
                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 flex flex-col group"
              >
                <div className="relative overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  {/* Optional: Show Category Badge on the image */}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-[#3a1710] shadow-sm">
                    {item.category || "Uncategorized"}
                  </span>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-[#3a1710]">{item.name}</h3>
                    <div className="flex flex-col items-end">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg">
                        Stock: {item.stock || 0}
                      </span>
                      <button onClick={() => handleUpdateStock(item._id, item.stock, item.name)} className="text-orange-500 text-[10px] font-bold mt-1 hover:text-orange-700 transition-colors uppercase tracking-wider">
                        Edit Stock
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-orange-500 font-black text-xl mt-1">₹{item.price}</p>
                  
                  <button onClick={() => deleteItem(item._id)} className="mt-auto pt-6 text-red-500 font-bold hover:text-red-700 transition-colors text-left">
                    Remove Item
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Admin;