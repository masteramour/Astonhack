import React, { useState } from 'react';
import dataService from '../services/dataService';
import { UserProfile } from '../types';

interface UserDataManagerProps {
  currentUser: UserProfile | null;
}

const UserDataManager: React.FC<UserDataManagerProps> = ({ currentUser }) => {
  const [importing, setImporting] = useState(false);

  const handleExportProfile = () => {
    if (!currentUser) {
      alert('No user logged in');
      return;
    }
    dataService.downloadUserDataAsJSON(currentUser.id, currentUser.name);
    alert(`Profile exported for ${currentUser.name}!`);
  };

  const handleImportProfile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const userData = await dataService.importUserProfileFromJSON(file);
      alert(`Profile imported successfully for ${userData.user.name}!`);
    } catch (error) {
      console.error('Error importing profile:', error);
      alert('Error importing profile. Please check the file format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-bold text-sm">{currentUser.name}</h3>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportProfile}
            className="text-xs bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500/20 transition-colors"
            title="Export your profile and donations as JSON"
          >
            📥 Export Profile
          </button>
          <label className="text-xs bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-500/20 transition-colors cursor-pointer"
            title="Import a previously saved profile">
            📤 Import Profile
            <input
              type="file"
              accept=".json"
              onChange={handleImportProfile}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <div className="text-xs text-slate-500">
        💡 Tip: Export your profile to backup your data. Import it anytime to restore your donations and information.
      </div>
    </div>
  );
};

export default UserDataManager;
