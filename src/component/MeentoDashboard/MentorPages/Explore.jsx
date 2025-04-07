import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faUserGraduate, faUserTie, faStar } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import { useAuth } from '../../../lib/AuthContext';
import { userApi } from '../../../lib/api';

function Explore() {
  const { upDatePage, handleToggleState, setSelectedMentee, AddMentees, acceptedMentees, setSelectedChatUser } =
    useContext(GlobalContext);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch all users regardless of role
        const response = await userApi.getAllUsers(); 
        console.log('Fetched users:', response.data); 
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Log users whenever it changes
  useEffect(() => {
    console.log('Updated users:', users);
  }, [users]);

  const filteredUsers = users
    .filter((item) => !acceptedMentees.some((mentee) => mentee.id === item._id))
    .filter((item) =>
      searchQuery
        ? item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.expertise && item.expertise.some(skill => 
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        : true
    );

  const handleStartChat = async (selectedUser) => {
    try {
      // Create a new conversation
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          participantId: selectedUser._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || 'Failed to create conversation');
      }

      const conversation = await response.json();

      // Add the user to messaging contacts
      AddMentees(selectedUser);

      // Navigate to the messaging page
      setSelectedChatUser(selectedUser);
      upDatePage('Message');
    } catch (error) {
      if (error.message === 'Conversation already exists') {
        console.warn('Conversation already exists. Redirecting to the chat page.');
        setSelectedChatUser(selectedUser);
        upDatePage('Message');
      } else {
        console.error('Error creating conversation:', error);
        setError('Failed to connect. Please try again.');
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      }
    }
  };

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
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No users found matching your search hi
            </p>
          </div>
        ) : (
          filteredUsers.map((userData) => (
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
                {console.log('Constructed Image URL:', userData.profilePicture?.startsWith('http')
                  ? userData.profilePicture
                  : `${import.meta.env.VITE_BACKEND_URL}${userData.profilePicture || '/uploads/profiles/default-profile.png'}`)}
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
                  onClick={() => handleStartChat(userData)}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Explore;