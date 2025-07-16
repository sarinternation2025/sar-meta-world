import React from 'react';

const UserList = ({ users }) => {
  return (
    <aside className="w-full max-w-xs bg-white rounded-2xl shadow-lg border border-[#e2e8f0] p-4">
      <h2 className="text-lg font-bold text-[#2563EB] mb-4 text-center">Users</h2>
      <ul className="space-y-3">
        {users.length === 0 ? (
          <li className="text-gray-400 text-center">No users online</li>
        ) : (
          users.map(user => (
            <li key={user.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[#64748b] font-bold">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  user.name[0]?.toUpperCase() || 'U'
                )}
              </div>
              <span className="font-medium text-[#1E293B]">{user.name}</span>
              <span className={`ml-auto w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-[#10B981]' : 'bg-gray-300'}`}></span>
              <span className={`text-xs ml-2 ${user.status === 'online' ? 'text-[#10B981]' : 'text-gray-400'}`}>{user.status === 'online' ? 'Online' : 'Offline'}</span>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default UserList; 