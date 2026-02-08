import React, { useState, useEffect } from 'react';
import { addDonation, getDonations, exportDataAsJSON, uploadDataFromJSON, downloadDataAsJSON } from '../services/dataService';
import UserDataManager from './UserDataManager';
import { UserProfile } from '../types';

interface DonationTrackerProps {
  currentUser: UserProfile | null;
}

const DonationTracker: React.FC<DonationTrackerProps> = ({ currentUser }) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [donationType, setDonationType] = useState<'time' | 'item'>('time');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load donations from localStorage (which was initialized from data.json)
    const allDonations = getDonations();
    console.log('Loaded donations:', allDonations);
    setDonations(allDonations);
  }, []);

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !amount || !category) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const newDonation = {
        id: Date.now().toString(),
        userId: currentUser.id,
        type: donationType,
        category: category,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
      };

      addDonation(newDonation);
      setDonations([...donations, newDonation]);
      setAmount('');
      setCategory('');
      alert('Donation recorded successfully!');
    } catch (error) {
      console.error('Error adding donation:', error);
      alert('Error recording donation');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    downloadDataAsJSON();
    alert('Data exported successfully! File will download to your computer.');
  };

  const handleUploadData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const mergedData = await uploadDataFromJSON(file);
      setDonations(mergedData.donations);
      alert('Data imported and merged successfully!');
    } catch (error) {
      console.error('Error uploading data:', error);
      alert('Error importing data. Please check the file format.');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  if (!currentUser) {
    return (
      <div className="p-12 text-center text-slate-500">
        Please log in to track donations
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <h2 className="text-2xl font-black mb-6">Track Your Donation</h2>
        
        <form onSubmit={handleAddDonation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Donation Type
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value as 'time' | 'item')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-brand"
              >
                <option value="time">Time (hours)</option>
                <option value="item">Items (count)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Amount
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={donationType === 'time' ? 'Hours' : 'Count'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-brand"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Food Drive, Beach Cleanup, Mentoring"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand text-white font-black rounded-2xl hover:bg-brand-dark transition-all disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Record Donation'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-black">Your Donations</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportData}
              className="text-xs bg-brand/10 text-brand px-4 py-2 rounded-xl font-bold hover:bg-brand/20 transition-colors"
            >
              📥 Export JSON
            </button>
            <label className="text-xs bg-green-500/10 text-green-600 px-4 py-2 rounded-xl font-bold hover:bg-green-500/20 transition-colors cursor-pointer">
              📤 Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleUploadData}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {donations.filter(d => d.userId === currentUser.id).length > 0 ? (
          <div className="space-y-3">
            {donations
              .filter(d => d.userId === currentUser.id)
              .map(donation => (
                <div key={donation.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold">{donation.category}</div>
                    <div className="text-sm text-slate-500">{new Date(donation.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-brand">
                      {donation.amount} {donation.type === 'time' ? 'hrs' : 'items'}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                      {donation.type}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No donations recorded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationTracker;
