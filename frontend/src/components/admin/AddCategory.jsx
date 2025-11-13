import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      toast.error("Please enter category name and select an image");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    setLoading(true);
    try {
      const res = await api.post("/api/admin/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      setName("");
      setImage(null);
      setPreview("");
      window.dispatchEvent(new Event("categoryAdded"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Title */}
        <div>
          <label className="block mb-1 font-medium">Category Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g. SSC"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-1 font-medium">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded p-2"
          />
          {preview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Preview"
                className="h-32 w-auto rounded-md border"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
