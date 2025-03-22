import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 


function Setting() {
    const [activeTab, setActiveTab] = useState('basicDetails');

    return (
        <div className="p-6">
            <div className="flex flex-wrap space-x-4 bg-white py-3 px-3 w-full md:w-fit rounded-md mb-6">
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
                    Social media link
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
                    <form className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700">Full Name</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 ">Mentorship Status</label>
                            <Select className="h-full rounded-xl p-2">
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cordial/Friendly">Cordial/Friendly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Age</label>
                            <input type="number" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Gender</label>
                            <Select className="p-2">
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="male">male</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Mode of Contact</label>
                            <Select className="h-full">
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Virtual">Virtual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Availability</label>
                            <Select className="h-full">
                                <SelectTrigger className="outline-none w-full border-2 rounded-xl h-[60px]">
                                    <SelectValue className="text-lg text-slate-500" placeholder="Select One" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available ASAP">Available ASAP</SelectItem>
                                    <SelectItem value="In a few weeks">In a few weeks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-1 md:col-span-2 mb-4">
                            <label className="block text-gray-700">Bio</label>
                            <textarea className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1"></textarea>
                        </div>
                        <div className="col-span-1 md:col-span-2">
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
                    <h2 className="text-xl font-bold mb-4">Social Media</h2>
                    <form className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700">Twitter</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" placeholder="Twitter Handle" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Facebook</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" placeholder="Facebook Profile" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">WhatsApp</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" placeholder="WhatsApp Number" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Instagram</label>
                            <input type="text" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" placeholder="Instagram Handle" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input type="email" className="flex items-center p-2 md:p-4 gap-3 w-full rounded-xl border-2 mt-1" placeholder="Email Address" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <button type="submit" className="bg-orange-500 text-white py-2 px-4 rounded">Save Changes</button>
                        </div>
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
