import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MessageSquare, Loader2, Search, ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { sessionApi, userApi } from '@/lib/api';

const CreateSession = () => {
  const navigate = useNavigate();
  const { handleToggleState, userRole } = useContext(GlobalContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);

  const [formData, setFormData] = useState({
    participant: '',
    date: '',
    time: '',
    duration: 60,
    topic: '',
    type: 'one-on-one',
    description: '',
    notes: ''
  });

  const startJitsiMeeting = () => {
    try {
      if (jitsiApi) {
        jitsiApi.dispose();
      }

      const domain = "meet.jit.si";
      const options = {
        roomName: `session-${formData.topic}-${Date.now()}`,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "600px",
        configOverwrite: {
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
        },
        userInfo: {
          displayName: selectedUser ? selectedUser.name : "Guest",
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(api);

      api.addListener("readyToClose", () => {
        console.log("Jitsi meeting closed");
        setJitsiApi(null);
      });

      return api;
    } catch (error) {
      console.error("Failed to initialize Jitsi meeting:", error);
      setError("Failed to start the meeting. Please try again.");
      return null;
    }
  };

  useEffect(() => {
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [jitsiApi]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userApi.getAllUsers(); // Use the endpoint to fetch all users
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      participant: user._id
    }));
    setIsDropdownOpen(false);
    setSearchQuery(user.name);
  };

  const validateForm = () => {
    if (!formData.participant) {
      setError(`Please select a ${userRole === 'mentor' ? 'mentee' : 'mentor'}`);
      return false;
    }
    if (!formData.date || !formData.time) {
      setError('Please select date and time');
      return false;
    }
    if (!formData.topic) {
      setError('Please enter a topic');
      return false;
    }
    if (formData.duration < 30 || formData.duration > 180) {
      setError('Duration must be between 30 and 180 minutes');
      return false;
    }
    
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime < new Date()) {
      setError('Please select a future date and time');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const sessionData = {
        ...formData,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        timezone: userTimezone,
        [userRole === 'mentor' ? 'menteeId' : 'mentorId']: formData.participant
      };

      const response = await sessionApi.create(sessionData);
      
      if (response.data) {
        setSuccessMessage('Session created successfully!');
        // Start Jitsi meeting after successful creation
        startJitsiMeeting();
        setTimeout(() => {
          navigate(userRole === 'mentor' ? '/mentor/sessions' : '/mentee/sessions');
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating session:", err);
      setError(err.response?.data?.message || 'Failed to create session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      participant: '',
      date: '',
      time: '',
      duration: 60,
      topic: '',
      type: 'one-on-one',
      description: '',
      notes: ''
    });
    setSelectedUser(null);
    setSearchQuery('');
    setError(null);
    setSuccessMessage(null);
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {userRole === 'mentor' ? 'Create Session with Mentee' : 'Request Mentor Session'}
        </h1>
        <button
          onClick={handleToggleState}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Participant Selection */}
        {/* 
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {userRole === 'mentor' ? 'Select a Mentee' : 'Select a Mentor'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${userRole === 'mentor' ? 'mentees' : 'mentors'} by name...`}
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() => setIsDropdownOpen(true)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {isDropdownOpen && (
            <div 
              className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
            >
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  No {userRole === 'mentor' ? 'mentees' : 'mentors'} found
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    role="option"
                    aria-selected={selectedUser?._id === user._id}
                  >
                    {user.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        */}

   
        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date  
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timggggggggg
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration (min)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            min="30"
            max="180"
            step="30"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topic
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            placeholder="What would you like to discuss?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Session Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="one-on-one">One-on-One</option>
            <option value="group">Group Session</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Provide more details about what you want to discuss..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional information..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Jitsi Meeting Container */}
        {jitsiApi && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Live Session</h2>
            <div id="jitsi-container" ref={jitsiContainerRef} />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Resetfff
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </div>
            ) : (
              'Create Session'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSession;