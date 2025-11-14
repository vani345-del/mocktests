import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyMockTests } from "../../redux/userSlice";
import MyTestCard from "../../components/student/MyTestCard";
import { ClipLoader } from "react-spinners";

const MyTests = () => {
  const dispatch = useDispatch();
  const { myMockTests, myMockTestsStatus, myMockTestsError } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (myMockTestsStatus === "idle") {
      dispatch(fetchMyMockTests());
    }
  }, [myMockTestsStatus, dispatch]);

  let content;

  if (myMockTestsStatus === "loading") {
    content = (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} color={"#123abc"} />
      </div>
    );
  } else if (myMockTestsStatus === "succeeded") {
    if (myMockTests.length === 0) {
      content = (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">
            You have not purchased any mock tests yet.
          </p>
        </div>
      );
    } else {
      content = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myMockTests.map((test) => (
            <MyTestCard key={test._id} test={test} />
          ))}
        </div>
      );
    }
  } else if (myMockTestsStatus === "failed") {
    content = (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500 text-lg">{myMockTestsError}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Mock Tests</h1>
      {content}
    </div>
  );
};

export default MyTests;
