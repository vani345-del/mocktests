import React, { useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaKey, 
  FaIdCard, 
  FaUpload 
} from "react-icons/fa";

const AddStudent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    bio: "",
    photo: null,
    studentId: "",
  });

  const [preview, setPreview] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  // Handle input fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    // Password validation
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

  // Upload Photo
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    const loading = toast.loading("Adding student...");

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));

      await api.post("/api/admin/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.dismiss(loading);
      toast.success("Student added successfully!");

      navigate("/admin/users/students/manage");
    } catch (err) {
      toast.dismiss(loading);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg mb-8">
        <h2 className="text-3xl font-bold">🎓 Add New Student</h2>
        <p className="opacity-90 mt-1">Fill out the details to register a new student.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white shadow-xl rounded-2xl border p-8">

        <h3 className="text-xl font-semibold mb-6 pb-2 border-b text-gray-800">
          👤 Student Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="label-style"><FaUser /> First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="beautiful-input"
                required
              />
            </div>

            <div>
              <label className="label-style"><FaUser /> Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="beautiful-input"
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="label-style"><FaEnvelope /> Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="beautiful-input"
                required
              />
            </div>

            <div>
              <label className="label-style"><FaPhone /> Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="beautiful-input"
              />
            </div>
          </div>

          {/* Student ID */}
          <div>
            <label className="label-style"><FaIdCard /> Student ID</label>
            <input
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              className="beautiful-input"
              placeholder="Optional (roll number)"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="label-style"><FaKey /> Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`beautiful-input ${passwordError ? "border-red-500" : ""}`}
                required
              />
            </div>

            <div>
              <label className="label-style"><FaKey /> Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`beautiful-input ${passwordError ? "border-red-500" : ""}`}
                required
              />

              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="label-style">Biography</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="beautiful-input min-h-[120px]"
              placeholder="Write something..."
            ></textarea>
          </div>

          {/* Upload Photo */}
          <div>
            <label className="label-style"><FaUpload /> Upload Student Photo</label>

            <div className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                id="photoUpload"
                className="hidden"
              />
              <label htmlFor="photoUpload" className="cursor-pointer">
                {!preview ? (
                  <p className="text-gray-500">Click or drag & drop to upload</p>
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
              className={`px-8 py-3 text-lg rounded-xl shadow-md transition 
                ${passwordError ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}
              `}
            >
              Add Student
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddStudent;
