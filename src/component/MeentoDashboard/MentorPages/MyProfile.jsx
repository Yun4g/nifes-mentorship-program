import React, { useState, useEffect } from 'react';
import { Star, BookOpen, Users, Loader2 } from 'lucide-react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRemove } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faFacebook, faWhatsapp, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import EditProfile from './EditProfile';
import { useContext } from 'react';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { userApi } from '../../../lib/api/userApi';

// Add icons to the library
library.add(faBars, faRemove, faTwitter, faFacebook, faWhatsapp, faInstagram, faLinkedin);

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image/default-profile.png";
  return imagePath;
};

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  profilePicture: '',
  gender: '',
  title: '',
  department: '',
  yearOfStudy: '',
  expertise: [],
  experience: '',
  social: {
    linkedIn: '',
    twitter: '',
    instagram: '',
    website: ''
  },
  interests: [],
  bio: '',
  overview: '',
  profileCompleted: false,
  mentorshipStatus: '',
  paymentCompleted: false,
  emailVerified: false
};

const Profile = () => {
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { upDatePage, handleToggleState, acceptedMentees, profile = defaultProfile, setProfile } = useContext(GlobalContext);
  
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try to get from localStorage for immediate display
      const storedProfile = localStorage.getItem('profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      // Fetch fresh data from the server
      const response = await userApi.getProfile();
      const profileData = response.data;
      
      // Update both context and localStorage
      setProfile(profileData);
      localStorage.setItem('profile', JSON.stringify(profileData));
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile data');
      if (!profile) {
        setProfile(defaultProfile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleEditProfile = () => {
    setEditProfileVisible(!isEditProfileVisible);
  };

  const handleImageError = (e) => {
    const originalSrc = e.currentTarget.src;
    if (!originalSrc.includes('default-profile.png')) {
      e.currentTarget.src = '/image/default-profile.png';
    }
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await userApi.updateProfile(updatedProfile);
      const updatedData = response.data;

      setProfile(updatedData);
      localStorage.setItem('profile', JSON.stringify(updatedData));
      setEditProfileVisible(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSocialLinks = () => {
    const socialLinks = [
      { icon: faLinkedin, url: profile?.social?.linkedIn, color: 'text-blue-600' },
      { icon: faTwitter, url: profile?.social?.twitter, color: 'text-blue-400' },
      { icon: faInstagram, url: profile?.social?.instagram, color: 'text-pink-500' },
      { icon: faWhatsapp, url: profile?.social?.website, color: 'text-green-500' }
    ];

    return (
      <div className="flex gap-4">
        {socialLinks.map((social, index) => (
          social.url && (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${social.color} hover:opacity-80 transition-opacity`}
            >
              <FontAwesomeIcon icon={social.icon} className="text-xl" />
            </a>
          )
        ))}
      </div>
    );
  };

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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-white pb-8 dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="h-48 rounded-t-xl bg-gradient-to-r from-blue-400 to-blue-600 relative" style={{ backgroundImage: 'url(/image/backImage.png)' }}>
              <div className="absolute -bottom-16 left-8 flex items-end">
                <img
                  src={getImageUrl(profile?.profilePicture)}
                  alt={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
                  onError={handleImageError}
                />
              </div>
            </div>
            <div className="pt-20 px-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-gray-800 dark:text-gray-200 text-2xl font-semibold">
                    {profile?.firstName || ''} {profile?.lastName || ''}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.title || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.email || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.department || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.yearOfStudy || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.gender || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.mentorshipStatus || ''}</p>
                  <p className="text-gray-600 dark:text-gray-400">{profile?.bio || ''}</p>
                  <h2 className="text-xl font-bold mb-4 mt-6">Social Media</h2>
                  {renderSocialLinks()}
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
                  {acceptedMentees?.map((mentee, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(mentee.profilePicture)}
                          alt={`${mentee.firstName} ${mentee.lastName}`}
                          className="w-12 h-12 rounded-full"
                          onError={handleImageError}
                        />
                        <div>
                          <h3 className="font-semibold">{mentee.firstName} {mentee.lastName}</h3>
                          <p className="text-sm text-gray-500">{mentee.department || 'Student'}</p>
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
                    {profile?.overview || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isEditProfileVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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