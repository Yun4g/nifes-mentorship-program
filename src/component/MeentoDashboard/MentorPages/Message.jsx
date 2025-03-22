import { GlobalContext } from "@/component/GlobalStore/GlobalState";
import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./Message.css"; // Import the CSS file

function Message() {
  const { upDatePage, handleToggleState, acceptedMentees } = useContext(GlobalContext);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (acceptedMentees) {
      setLoading(false);
    } else {
      setError(new Error("No accepted mentees found"));
    }
  }, [acceptedMentees]);

  if (loading) {
    return <div className="text-center text-slate-500 py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-6">Error: {error.message}</div>;
  }

  const filterMentee = acceptedMentees.filter((mentee) =>
    inputValue
      ? mentee.first_name.toLowerCase().includes(inputValue.toLowerCase()) ||
        mentee.last_name.toLowerCase().includes(inputValue.toLowerCase())
      : true
  );

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* Header Section */}
      <header className="flex  justify-between w-full  mb-6">
        <div className=" flex w-full  justify-between  flex-col md:flex-row">
        <div className="flex flex-col gap-2 md:gap-4">
          <h1 className="text-2xl md:text-3xl font-medium">Message</h1>
          <p className="text-sm md:text-base font-medium text-slate-600">Easy Communication with everyone</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <img
            onClick={() => upDatePage("Message")}
            src="/image/messageIcon.png"
            className="w-10 h-10 md:w-12 md:h-12 cursor-pointer"
            alt="Message Icon"
            loading="lazy"
          />
          <img
            onClick={() => upDatePage("Setting")}
            src="/image/settingIcon.png"
            className="w-10 h-10 md:w-12 md:h-12 cursor-pointer"
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row border-4 rounded-3xl bg-white overflow-hidden">
        {/* Sidebar */}
        <div className="h-full w-full md:w-1/3 p-4 custom-scrollbar border-r-2">
          <div className="h-20 mb-4">
            <div className="w-full h-14 rounded-xl ps-3 border-2 flex items-center">
              <button aria-label="Search">
                <FontAwesomeIcon className="text-slate-500" icon={faSearch} />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="outline-none ps-2 h-full w-full"
                placeholder="Search by Name"
                aria-label="Search by Name"
              />
            </div>
          </div>

          {/* Mentee List */}
          <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="flex flex-col  gap-5">
              {!filterMentee.length ? (
                <div className="text-gray-500">No Mentee Accepted</div>
              ) : (
                filterMentee.map((mentee) => (
                  <div
                    key={mentee.id}
                    className="flex items-center scrollbar-hide cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <img
                      src={mentee.avatar || '/default-avatar.png'}
                      alt={`${mentee.first_name}'s avatar`}
                      className="w-14 h-14 rounded-lg mr-4"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-medium">
                        {mentee.first_name} {mentee.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{mentee.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="h-full w-full md:w-2/3 flex flex-col">
          <header className="flex p-4 border-b-2 justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="h-11 w-11">
                <img src="/image/img.png" className="h-full w-full" loading="lazy" alt="Profile" />
              </div>
              <div>
                <p>Olaide Bamisebi</p>
                <p className="text-sm text-green-500">Available</p>
              </div>
            </div>
          </header>

          {/* Chat Messages */}
          <section className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {/* Example messages */}
            <div className="flex flex-col gap-4">
              <div className="self-start bg-gray-200 p-3 rounded-lg max-w-xs">
                <p className="text-sm">Hello, how are you?</p>
              </div>
              <div className="self-end bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                <p className="text-sm">I'm good, thank you!</p>
              </div>
              {/* Add more messages here */}
            </div>
          </section>

          {/* Message Input */}
          <div className="p-4 border-t-2">
            <div className="flex items-center border-2 rounded-xl p-2">
              <input
                type="text"
                className="outline-none flex-1 px-2"
                placeholder="Type a message"
                aria-label="Type a message"
              />
              <button className="rotate-45 cursor-pointer" aria-label="Send message">
                <FontAwesomeIcon className="text-slate-600" icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Message;