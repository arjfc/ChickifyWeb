import { FaApple, FaGooglePlay, FaInstagram, FaFacebook } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";

export default function Footer() {
  return (
    <div className="bg-softPrimaryYelllow w-full px-10 py-5 border-2">
      <footer className="flex flex-col p-4 gap-5">
        <div className="flex flex-row justify-between items-center">
          <div className="text-secondaryYellow font-semibold text-lg leading-tight">
            <p className="">Bantayan Island, Cebu, Philippines</p>
            <p className="">sampleemail@gmail.com</p>
            <p className="">09878787878</p>
          </div>
          <div className="flex flex-row gap-5">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-primaryYellow px-4 py-2 text-white hover:bg-gray-800 transition"
            >
              <FaApple className="text-2xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs">Download on the</span>
                <span className="text-sm font-semibold">App Store</span>
              </div>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-primaryYellow px-4 py-2 text-white hover:bg-gray-800 transition"
            >
              <FaGooglePlay className="text-2xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xs">Get it on</span>
                <span className="text-sm font-semibold">Google Play</span>
              </div>
            </a>
          </div>
        </div>
        <hr className="text-primaryYellow" />
        <div className="flex flex-row justify-between items-center">
          <p className="text-secondaryYellow">© 2025 Team Etlogers</p>
          <div className="flex gap-4 mt-2">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <CiShare2 className="text-3xl text-secondaryYellow hover:text-yellow-500 transition duration-300" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="text-3xl text-secondaryYellow hover:text-yellow-500 transition duration-300" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="text-3xl text-secondaryYellow hover:text-yellow-500 transition duration-300" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
