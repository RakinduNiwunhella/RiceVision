import ProfileForm from "./ProfileForm";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 px-4 py-10 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Update your profile details below.
        </p>

        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;