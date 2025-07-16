import React from 'react';
import { useIsAdmin } from '../hooks/useIsAdmin';

const AdminOnly = ({ children }) => {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <div className="text-red-600 text-center p-8">Admin access required. Please log in as an admin.</div>;
  return children;
};

export default AdminOnly; 