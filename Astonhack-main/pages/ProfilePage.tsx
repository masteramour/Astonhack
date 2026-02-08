
import React from 'react';
import { useParams } from 'react-router-dom';
import VolunteerDetailPage from './VolunteerDetailPage';
import { UserProfile } from '../types';

const ProfilePage: React.FC<{
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile | null) => void
}> = ({ currentUser, setCurrentUser }) => {
  const { id } = useParams();

  // If the requested id matches the current logged-in user, pass the user directly
  // otherwise VolunteerDetailPage will look up the user from MOCK_USERS
  const overrideUser = id && currentUser && id === currentUser.id ? currentUser : undefined;

  return <VolunteerDetailPage overrideUser={overrideUser} setCurrentUser={setCurrentUser} />;
};

export default ProfilePage;
