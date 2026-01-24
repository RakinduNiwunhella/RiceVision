import { useState } from "react";
import InputField from "./InputField";

const ProfileForm = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    district: "",
    address: "",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Profile Data:", profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-3xl font-semibold text-green-700">
            {profile.firstName
              ? profile.firstName.charAt(0).toUpperCase()
              : "U"}
          </span>
        </div>
        
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="First Name"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
        />

        <InputField
          label="Last Name"
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
        />

        <InputField
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="example@email.com"
        />

        <InputField
          label="Phone Number"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="07XXXXXXXX"
        />

        <InputField
          label="NIC Number"
          name="nic"
          value={profile.nic}
          onChange={handleChange}
          placeholder="200012345678"
        />

        <InputField
          label="District"
          name="district"
          value={profile.district}
          onChange={handleChange}
          placeholder="Enter your district"
        />

        <div className="md:col-span-2">
          <InputField
            label="Address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            placeholder="Enter your address"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;