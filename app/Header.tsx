import React from "react";
import { FaGithub } from "react-icons/fa";

const Header = () => {
  return (
    <header className="p-4 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg text-black flex items-center fixed top-0 left-0 w-full z-50">
      <a
        href="https://github.com/yukiwith5267/inspired_speech"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-sm"
      >
        <FaGithub className="mr-2" />
        Source Code
      </a>
    </header>
  );
};

export default Header;
