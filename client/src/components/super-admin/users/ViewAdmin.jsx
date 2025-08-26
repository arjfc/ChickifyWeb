import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

function ViewAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  if (!user) return <p>No user data provided</p>;

  return (
    <div className="flex flex-col gap-5">
      {/* Card */}
      <div className="px-10 pt-8 pb-12 flex flex-col gap-6 rounded-lg border border-gray-200 shadow-lg mt-5 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-row gap-3 items-center">
          <FaUserCircle className="w-20 h-20 text-gray-400" />
          <div>
            <p className="text-xl font-semibold text-primaryYellow">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {/* Row 1: Email, Sex, Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-400"
              >
                E-mail
              </label>
              <input
                type="text"
                id="email"
                value={user.email}
                readOnly
                className="w-full max-w-xs px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="sex"
                className="block text-sm font-semibold text-gray-400"
              >
                Sex
              </label>
              <input
                type="text"
                id="sex"
                value={user.sex || "Not provided"}
                readOnly
                className="w-full max-w-xs px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-400"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                value={user.phone || "Not provided"}
                readOnly
                className="w-full max-w-xs px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm"
              />
            </div>
          </div>

          {/* Row 2: Address */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-400"
            >
              Address
            </label>
            <textarea
              id="address"
              value={user.address || "Not provided"}
              readOnly
              rows={2}
              className="w-full max-w-2xl px-2 py-1 rounded-md border border-gray-300 bg-gray-50 text-gray-700 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex items-center justify-center">
        <button
          className="cursor-pointer text-lg rounded-lg text-white font-bold bg-primaryYellow px-10 py-2"
          onClick={() => navigate("/super-admin/users")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default ViewAdmin;
