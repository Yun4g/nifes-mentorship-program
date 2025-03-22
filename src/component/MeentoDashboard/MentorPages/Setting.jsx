import React, { useState } from 'react';

function Setting() {
    const [activeTab, setActiveTab] = useState('basicDetails');

    return (
        <div className="p-6 ">
            <div className="flex space-x-4  bg-white py-3 px-3 w-fit rounded-md mb-6">
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'basicDetails' ? 'bg-orange-500 text-white ' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('basicDetails')}
                >
                    Basic Details
                </button>
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'mentorPreferences' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('mentorPreferences')}
                >
                    Mentor Preferences
                </button>
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'notifications' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
                <button
                    className={`py-2 rounded-lg transition-colors duration-300 px-4 ${activeTab === 'loginAndSecurity' ? 'bg-orange-500 text-white' : 'bg-white text-black'}`}
                    onClick={() => setActiveTab('loginAndSecurity')}
                >
                    Login and Security
                </button>
            </div>

            {activeTab === 'basicDetails' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Profile Details</h2>
                    <form className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700">Full Name</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Mentorship Status</label>
                            <select className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1">
                                <option>Cordial/Friendly</option>
                                {/* ...other options... */}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Age</label>
                            <input type="number" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Gender</label>
                            <select className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1">
                                <option>Female</option>
                                
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Mode of Contact</label>
                            <select className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1">
                                <option>Virtual</option>
                              
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Availability</label>
                            <select className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1">
                                <option>Available ASAP</option>
                                
                            </select>
                        </div>
                        <div className="col-span-2 mb-4">
                            <label className="block text-gray-700">Bio</label>
                            <textarea className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"></textarea>
                        </div>
                        <div className="col-span-2">
                            <button type="submit" className="bg-orange-500 text-white py-2 px-4 rounded">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'mentorPreferences' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Mentor Preferences</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700">Preferred Mentor</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <button type="submit" className="bg-orange-500 text-white py-2 px-4 rounded">Save Changes</button>
                    </form>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Notifications</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email Notifications</label>
                            <input type="checkbox" className="mr-2" />
                            Enable email notifications
                        </div>
                        <button type="submit" className="bg-orange-500 text-white py-2 px-4 rounded">Save Changes</button>
                    </form>
                </div>
            )}

            {activeTab === 'loginAndSecurity' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Login and Security</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input type="password" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Confirm Password</label>
                            <input type="password" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <button type="submit" className="bg-orange-500 text-white py-2 px-4 rounded">Save Changes</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Setting;
