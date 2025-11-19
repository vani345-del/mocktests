import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaKey, 
  FaUserTie, 
  FaUpload 
} from "react-icons/fa";

const AddInstructor = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "instructor",
    bio: "",
    photo: null,
  });

  const [preview, setPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    // PASSWORD MATCH CHECK
    if (name === "password" || name === "confirmPassword") {
      if (
        (name === "password" && form.confirmPassword && value !== form.confirmPassword) ||
        (name === "confirmPassword" && form.password && value !== form.password)
      ) {
        setPasswordError("Passwords do not match ❌");
      } else {
        setPasswordError("");
      }
    }
  };

  // Handle photo
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // FRONTEND PASSWORD CHECK
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    const loading = toast.loading("Adding instructor...");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));

      await api.post("/api/admin/instructors", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loading);
      toast.success("Instructor added successfully!");

      navigate("/admin/users/instructors/manage");
    } catch (err) {
      toast.dismiss(loading);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg mb-8">
        <h2 className="text-3xl font-bold">➕ Add New Instructor</h2>
        <p className="opacity-90 mt-1">
          Fill out the details to add a new instructor.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white shadow-xl rounded-2xl border p-8">

        <h3 className="text-xl font-semibold mb-6 pb-2 border-b text-gray-800">
          👤 Basic Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="label-style">
                <FaUser /> First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="beautiful-input"
              />
            </div>

            <div>
              <label className="label-style">
                <FaUser /> Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="beautiful-input"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="label-style">
                <FaEnvelope /> Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="beautiful-input"
              />
            </div>

            <div>
              <label className="label-style">
                <FaPhone /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="beautiful-input"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-style">
                <FaKey /> Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`beautiful-input ${
                  passwordError ? "border-red-500 focus:border-red-500" : ""
                }`}
                required
              />
            </div>

            <div>
              <label className="label-style">
                <FaKey /> Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`beautiful-input ${
                  passwordError ? "border-red-500 focus:border-red-500" : ""
                }`}
                required
              />

              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="label-style">
              <FaUserTie /> Role *
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="beautiful-input"
            >
              <option value="instructor">Instructor</option>
           
            </select>
          </div>

          {/* Biography */}
          <div>
            <label className="label-style">Biography</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="beautiful-input min-h-[120px]"
              placeholder="Write something about the instructor..."
            ></textarea>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="label-style">
              <FaUpload /> Upload Profile Photo
            </label>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
                id="photoUpload"
              />
              <label htmlFor="photoUpload" className="cursor-pointer">
                {!preview ? (
                  <p className="text-gray-500">
                    Drag & drop or click to upload
                  </p>
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border mx-auto shadow-md"
                  />
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 text-right">
            <button
              type="submit"
              disabled={passwordError !== ""}
              className={`px-8 py-3 text-lg rounded-xl shadow-md transition ${
                passwordError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Add Instructor
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddInstructor;
