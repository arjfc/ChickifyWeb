import MapImage from "../../assets/map.png";

export default function Contact() {
  return (
    <div className="relative w-full bg-black z-5" id="contact">
      {/* Background Map */}
      <img
        src={MapImage}
        alt="Map"
        className="w-full h-[400px] md:h-[600px] object-cover object-center"
      />

      {/* Contact Form */}
      <div
        className="
      absolute inset-x-4 top-10 
      md:inset-auto md:top-20 md:right-20
      bg-black p-6 md:p-8 rounded-2xl shadow-lg 
      w-full max-w-[520px]
    "
      >
        <form className="flex flex-col space-y-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="block text-sm md:text-base font-semibold text-yellow-400"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 bg-white focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="block text-sm md:text-base font-semibold text-yellow-400"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="message"
              className="block text-sm md:text-base font-semibold text-yellow-400"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="
      w-full px-3 py-2 rounded-md bg-white 
      focus:outline-none focus:ring-2 focus:ring-yellow-400
      resize-y min-h-[100px] max-h-[200px]
    "
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-md shadow hover:bg-yellow-500 transition"
          >
            Send Message
          </button>
        </form>
      </div>

      <h2
        className="
      absolute left-6 bottom-10
      md:left-20 md:bottom-20
      text-3xl md:text-6xl font-bold text-yellow-400
    "
      >
        Contact Us
      </h2>
    </div>
  );
}
