import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addItemToCart } from "../../redux/cartSlice";
import toast from "react-hot-toast";

const MockTestCard = ({ test }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const handleAdd = () => {
    console.log("Add clicked");
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    dispatch(addItemToCart(test._id));
  };

  const handleBuy = () => {
    console.log("Buy clicked");
    if (!userData) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    navigate(`/mocktests/${test._id}`);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md text-black">
      <h2 className="text-lg font-bold mb-4">{test.title}</h2>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleAdd}
          className="bg-gray-800 text-white py-2 rounded-md"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuy}
          className="bg-blue-600 text-white py-2 rounded-md"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default MockTestCard;
