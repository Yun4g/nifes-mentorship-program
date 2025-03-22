import React, { useState, useEffect } from 'react';
import { Star, BookOpen, Users } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRemove } from '@fortawesome/free-solid-svg-icons';
import EditProfile from './EditProfile'; // Import the EditProfile component
import axios from 'axios'; // Import axios for backend communication
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';

const Profile = () => {
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const { upDatePage, handleToggleState, acceptedMentees } = useContext(GlobalContext);
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    overview: "",
    areaOfInterest: "",
    email: "",
    image: ""
  });

  useEffect(() => {
    // Load profile data from local storage if available
    const storedProfile = localStorage.getItem('profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      // Fetch the profile data from the backend when the component mounts
      axios.get('/api/getProfile')
        .then(response => {
          setProfile(response.data);
          localStorage.setItem('profile', JSON.stringify(response.data));
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
        });
    }
  }, []);

  const toggleEditProfile = () => {
    setEditProfileVisible(!isEditProfileVisible);
  };

  const handleImageError = (e) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(e.currentTarget.alt)}&background=random`;
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setEditProfileVisible(false);
    // Save the updated profile to local storage
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    // Update the backend with the new profile details
    axios.post('/api/updateProfile', updatedProfile)
      .then(response => {
        console.log('Profile updated successfully:', response.data);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
      });
  };

  const mentors = [
    {
      name: "Emma Naku",
      image: "/mentors/emma.jpg",
      rating: 4.8,
      role: "Senior Software Engineer"
    },
    {
      name: "Asake Olamide",
      image: "/mentors/asake.jpg",
      rating: 4.7,
      role: "Product Manager"
    },
    {
      name: "Ruona Obi",
      image: "/mentors/ruona.jpg",
      rating: 4.9,
      role: "UX Designer"
    }
  ];

  return (
    <div className="h-fit bg-gray-50 dark:bg-gray-900 pb-8">
      <header className="flex mt-4 justify-between px-4 mb-8">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-medium">My profile</h1>
            <p className="text-base font-medium text-slate-600">
            {acceptedMentees && acceptedMentees.length > 0 
              ? `You have ${acceptedMentees.length} upcoming session${acceptedMentees.length > 1 ? 's' : ''}`
              : 'You have no upcoming sessions'}
          </p>
          </div>
          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
            />
          </div>
        </div>
        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white pb-8 dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="h-48 rounded-t-xl bg-gradient-to-r from-blue-400 to-blue-600 relative" style={{ backgroundImage: 'url(/image/backImage.png)' }}>
            <div className="absolute -bottom-16 left-8 flex items-end">
              <img
                src={profile.image || "/image/young-people-working-from-modern-place 1.png"}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
                onError={handleImageError}
              />
            </div>
          </div>
          <div className="pt-20 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.fullName }</h1>
                <p className="text-gray-600 dark:text-gray-400">{profile.role}</p>
                <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              </div>
              <button
                className="text-orange-500 hover:text-orange-600 font-medium"
                onClick={toggleEditProfile}
              >
                Edit Profile
              </button>
            </div>
       
            <div className="mt-8 flex gap-8">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total learning time</p>
                  <p className="font-semibold">1,570 hrs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sessions completed</p>
                  <p className="font-semibold">25</p>
                </div>
              </div>
            </div>
            <div className="mt-12">
              <h2 className="text-lg font-semibold mb-4">My Mentees</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mentors.map((mentor, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-12 h-12 rounded-full"
                        onError={handleImageError}
                      />
                      <div>
                        <h3 className="font-medium">{mentor.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.role}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm ml-1">{mentor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12 bg-slate-200 px-8 py-8 rounded-3xl">
              <h2 className="text-lg font-semibold mb-2">Overview</h2>
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                  {profile.overview}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditProfileVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="dark:bg-gray-800 bg-white p-2 lg:w-fit border rounded-2xl shadow-lg">
            <button onClick={toggleEditProfile} className="bg-customOrange bg-opacity-50 h-6 w-6 rounded-full float-right">
              <FontAwesomeIcon className='text-slate-50' icon={faRemove} />
            </button>
            <EditProfile profile={profile} onUpdate={handleProfileUpdate} setIsEditProfileVisible={setEditProfileVisible} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;