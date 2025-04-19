import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { userApi } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext'; // Import the authentication context
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

function Explore() {
  const { upDatePage, handleToggleState } = useContext(GlobalContext);
  const { token } = useAuth(); // Get the token from the authentication context
  const navigate = useNavigate(); // Initialize navigate for redirection
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRequests, setSentRequests] = useState([]); // Track users who received a connection request

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await userApi.getAllUsers();
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error.response?.data?.message || error.message);
        setError(error.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleConnect = async (selectedUser) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      console.log('Token:', token); // Debug: Log the token to verify its value

      if (!token) {
        alert('You are not logged in. Redirecting to login page...');
        navigate('/login'); // Redirect to login page if token is missing
        return;
      }

      if (!selectedUser._id) {
        throw new Error('Invalid recipient ID');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/send-connection-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          recipientId: selectedUser._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Failed to send connection email');
      }

      const result = await response.json();
      console.log('Connection email sent successfully:', result);
      alert('Connection email sent successfully!');

      // Add the user to the sentRequests list
      setSentRequests((prev) => [...prev, selectedUser._id]);
    } catch (error) {
      console.error('Error sending connection email:', error);
      setError(error.message || 'Failed to send connection email. Please try again.');
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Filter users to exclude those who have received a connection request unless searched
  const filteredUsers = users.filter((user) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }
    return !sentRequests.includes(user._id);
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-lg font-medium">Error loading users</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="flex justify-between mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">
              Connect with Meentors and Mentees
            </h1>
            <p className="text-base font-medium text-slate-600">
              life changing encounters for everyone
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>

        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, or expertise..."
            className="w-full pl-12 pr-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((userData) => (
          <div
            key={userData._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300"
          >
            {/* User Image */}
            <div className="relative h-48">
              <img
                src={
                  userData.profilePicture?.startsWith('http')
                    ? userData.profilePicture
                    : `${import.meta.env.VITE_BACKEND_URL}${userData.profilePicture || '/uploads/profiles/default-profile.png'}`
                }
                alt={userData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', e.currentTarget.src); // Log the failed URL
                  e.currentTarget.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/profiles/default-profile.png`; // Fallback to backend default image
                }}
              />
            </div>

            {/* User Info */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {`${userData.firstName} ${userData.lastName}`}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Role: {userData.role || 'N/A'}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {userData.interests?.map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              {/* Connect Button */}
              <button
                onClick={() => handleConnect(userData)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Explore;