import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import React, { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faVideo, faClock, faCalendar, faUser } from '@fortawesome/free-solid-svg-icons';
import Pending from './messageComponemts/Pending';
import Histroy from './messageComponemts/histroy';
import SessionNotification from './messageComponemts/SessionNotification';
import { sessionApi, userApi } from '@/lib/api';

function Booking() {
  const { upDatePage, handleToggleState, userRole } = useContext(GlobalContext);
  const [components, setComponents] = useState('Pending');
  const [pendingSessions, setPendingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mentor: '',
    date: '',
    time: '',
    duration: 60,
    topic: '',
    type: 'one-on-one',
    description: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (components === 'Pending') {
          const response = await sessionApi.getPending();
          setPendingSessions(response.data);
        } else if (components === 'History') {
          const response = await sessionApi.getHistory();
          setHistorySessions(response.data);
        } else if (components === 'Create') {
          const response = userRole === 'mentor' 
            ? await userApi.getMentees()
            : await userApi.getMentors();
          setMentors(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [components, userRole]);

  const changeStateToPending = () => {
    setComponents('Pending');
  };

  const changeStateToHistory = () => {
    setComponents('History');
  };

  const changeStateToCreate = () => {
    setComponents('Create');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.mentor) {
      setError('Please select a mentor');
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
      
      const sessionData = {
        ...formData,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration)
      };

      const response = await sessionApi.create(sessionData);
      
      if (response.data) {
        setComponents('Pending');
        setFormData({
          mentor: '',
          date: '',
          time: '',
          duration: 60,
          topic: '',
          type: 'one-on-one',
          description: '',
          notes: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const joinJitsiMeeting = (roomId) => {
    window.open(`https://meet.jit.si/${roomId}`, '_blank');
  };

  const getCreateButtonText = () => {
    return userRole === 'mentor' ? 'Connect with Mentee' : 'Create Session';
  };

  const displayComponent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
          {error}
        </div>
      );
    }

    switch (components) {
      case 'Pending':
        return (
          <>
            <SessionNotification sessions={pendingSessions} />
            <Pending sessions={pendingSessions} onJoinMeeting={joinJitsiMeeting} />
          </>
        );
      case 'History':
        return <Histroy sessions={historySessions} />;
      case 'Create':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Mentee to Connect With
              </label>
              <select
                name="mentor"
                value={formData.mentor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose a mentee to connect with</option>
                {mentors.map(mentee => (
                  <option key={mentee._id} value={mentee._id}>
                    {mentee.name} - {mentee.department || 'No Department'} (Year {mentee.yearOfStudy || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="one-on-one">One-on-One</option>
                <option value="group">Group Session</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Provide more details about what you want to discuss..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information you'd like to share..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {userRole === 'mentor' ? 'Connecting...' : 'Creating Session...'}
                  </>
                ) : (
                  userRole === 'mentor' ? 'Connect with Mentee' : 'Schedule Session'
                )}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <section className="p-3 md:p-0">
      {/* Header Section */}
      <header className="flex justify-between">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">Bookings</h1>
            <p className="text-base font-medium text-slate-600">Manage your mentoring sessions</p>
          </div>

          <div className="flex items-center gap-4">
            <img
              onClick={() => upDatePage('Message')}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage('Setting')}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <main className="mt-14">
        <div className="p-2 bg-white w-fit flex items-center gap-2 rounded-md cursor-pointer shadow-sm">
          <button
            onClick={changeStateToPending}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'Pending' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={changeStateToHistory}
            className={`h-10 w-28 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'History' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            History
          </button>
          <button
            onClick={changeStateToCreate}
            className={`h-10 px-4 rounded-md text-black font-semibold transition-colors duration-300 ${
              components === 'Create' ? 'bg-orange-500 text-white' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {getCreateButtonText()}
          </button>
        </div>

        <section className="w-full h-full overflow-scroll bg-white mt-4 p-6 rounded-lg shadow-sm">
          {displayComponent()}
        </section>
      </main>
    </section>
  );
}

export default Booking;