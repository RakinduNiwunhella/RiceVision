import ProfileForm from "./ProfileForm";

const Profile = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 px-6 py-10">
      <div className="w-full max-w-6xl mx-auto 
bg-white dark:bg-slate-900 
rounded-2xl shadow-sm 
border border-slate-200 dark:border-slate-800 
p-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-10">
          Update your profile details below.
        </p>

        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;