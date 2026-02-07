
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import VolunteerDetailPage from './VolunteerDetailPage';

const ProfilePage: React.FC = () => {
  const { id } = useParams();
  
  // For demo purposes, we just reuse the VolunteerDetailPage
  // In a real app, this would have edit functionality.
  return <VolunteerDetailPage />;
};

export default ProfilePage;
