// frontend/src/components/student/GrandTestLeaderboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrandTestLeaderboard } from '../../redux/mockTestSlice';
import { ClipLoader } from 'react-spinners';
import { FaTrophy } from 'react-icons/fa';

const GrandTestLeaderboard = ({ mockTestId, title }) => {
  const dispatch = useDispatch();
  
  // Read from the 'mocktest' slice where we added the leaderboard state
  const { 
    leaderboards, 
    leaderboardStatus, 
    leaderboardError 
  } = useSelector((state) => state.mocktest);

  // Get the specific leaderboard for this testId
  const leaderboard = leaderboards[mockTestId];

  useEffect(() => {
    // Only fetch if we don't already have data for this test
    if (!leaderboard && mockTestId && leaderboardStatus !== 'loading') {
      dispatch(fetchGrandTestLeaderboard(mockTestId));
    }
  }, [dispatch, mockTestId, leaderboard, leaderboardStatus]);

  let content;
  if (leaderboardStatus === 'loading' && !leaderboard) {
    content = (
      <div className="flex justify-center items-center py-4">
        <ClipLoader size={20} color={"#4A90E2"} />
      </div>
    );
  } else if (leaderboard) {
    // We have data, display it
    if (leaderboard.length === 0) {
      content = <p className="text-gray-500 text-sm px-3 py-2">No completed attempts yet.</p>;
    } else {
      const colors = ["text-yellow-400", "text-gray-400", "text-yellow-600"];
      content = (
        <ol className="space-y-3">
          {leaderboard.map((entry, index) => (
            <li 
              key={entry.rank} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="flex items-center font-medium text-gray-700">
                <FaTrophy className={`mr-2 ${colors[index] || 'text-gray-300'}`} />
                {entry.rank}. {entry.name}
              </span>
              <span className="font-bold text-blue-600">{entry.score} Marks</span>
            </li>
          ))}
        </ol>
      );
    }
  } else if (leaderboardError) {
    // Display the specific error from the backend (e.g., "test not over yet")
    content = <p className="text-red-500 text-sm px-3 py-2">{leaderboardError}</p>;
  } else {
    // Default state before fetching
    content = <p className="text-gray-400 text-sm px-3 py-2">Loading leaderboard...</p>;
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b border-gray-200 pb-2">
        {title} - Top 3
      </h3>
      {content}
    </div>
  );
};

export default GrandTestLeaderboard;