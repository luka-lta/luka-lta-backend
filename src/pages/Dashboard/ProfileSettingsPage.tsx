export function ProfileSettingsPage() {
    return (
        <div className="flex w-full min-h-screen bg-gray-900 text-white">
            <aside className="w-1/5 p-4 bg-gray-800">
                <h2 className="text-xl font-bold">Settings</h2>
                <p className="text-sm text-gray-400">Manage your account settings and set e-mail preferences.</p>
                <nav className="mt-6 space-y-2">
                    <a href="#" className="block p-2 text-white bg-gray-700 rounded">
                        Profile
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Account
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Appearance
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Notifications
                    </a>
                    <a href="#" className="block p-2 text-gray-400 hover:text-white">
                        Display
                    </a>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <h2 className="text-xl font-bold">Profile</h2>
                <p className="text-sm text-gray-400">This is how others will see you on the site.</p>
                <form className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            defaultValue="shadcn"
                            className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
                        />
                        <p className="mt-1 text-sm text-gray-400">
                            This is your public display name. It can be your real name or a pseudonym. You can only change this once
                            every 30 days.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email
                        </label>
                        <select id="email" className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded">
                            <option>Select a verified email to display</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-400">
                            You can manage verified email addresses in your email settings.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
                            defaultValue="I own a computer."
                        />
                        <p className="mt-1 text-sm text-gray-400">
                            You can @mention other users and organizations to link to them.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="urls" className="block text-sm font-medium">
                            URLs
                        </label>
                        <input
                            type="text"
                            id="urls"
                            className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
                            defaultValue="https://shadcn.com"
                        />
                        <input
                            type="text"
                            id="urls"
                            className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
                            defaultValue="http://twitter.com/shadcn"
                        />
                        <button type="button" className="px-4 py-2 mt-2 text-sm text-white bg-gray-700 rounded">
                            Add URL
                        </button>
                    </div>
                    <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded">
                        Update profile
                    </button>
                </form>
            </main>
        </div>
    )
}