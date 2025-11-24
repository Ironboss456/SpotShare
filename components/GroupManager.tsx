import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Group, UserProfile } from '../types';
import { Users, Plus, Key, Search, Shield, X, Check } from 'lucide-react';

interface GroupManagerProps {
  user: UserProfile;
  activeGroupId: string | 'PUBLIC';
  onGroupSelect: (groupId: string | 'PUBLIC') => void;
  onClose: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ user, activeGroupId, onGroupSelect, onClose }) => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'JOIN'>('LIST');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  
  // Create Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Join Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    fetchMyGroups();
    fetchAllGroups();
  }, [user.id]);

  const fetchMyGroups = async () => {
    const { data } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', user.id);
    
    if (data) {
      setMyGroups(data.map((d: any) => d.groups));
    }
  };

  const fetchAllGroups = async () => {
    const { data } = await supabase.from('groups').select('*');
    if (data) setAllGroups(data);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;

    const { data: groupData, error } = await supabase.from('groups').insert([{
      name: newGroupName,
      description: newGroupDesc,
      creator_id: user.id,
      is_private: isPrivate,
      join_code: isPrivate ? joinCode : null
    }]).select();

    if (groupData && !error) {
      // Auto join creator
      await supabase.from('group_members').insert([{
        group_id: groupData[0].id,
        user_id: user.id
      }]);
      fetchMyGroups();
      setView('LIST');
    }
  };

  const handleJoinGroup = async (group: Group) => {
    if (group.is_private && inputCode !== group.join_code) {
      alert("Incorrect Join Code");
      return;
    }

    const { error } = await supabase.from('group_members').insert([{
      group_id: group.id,
      user_id: user.id
    }]);

    if (!error) {
      fetchMyGroups();
      setView('LIST');
      setInputCode('');
    }
  };

  const renderCreate = () => (
    <form onSubmit={handleCreateGroup} className="space-y-4 p-1">
      <h3 className="font-bold text-slate-800">Create New Group</h3>
      <input 
        className="w-full p-2 border rounded-lg" 
        placeholder="Group Name" 
        value={newGroupName} 
        onChange={e => setNewGroupName(e.target.value)} 
      />
      <textarea 
        className="w-full p-2 border rounded-lg" 
        placeholder="Description" 
        value={newGroupDesc} 
        onChange={e => setNewGroupDesc(e.target.value)} 
      />
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={isPrivate} 
          onChange={e => setIsPrivate(e.target.checked)} 
          id="private-check"
        />
        <label htmlFor="private-check" className="text-sm">Require Password to Join?</label>
      </div>
      {isPrivate && (
        <input 
          className="w-full p-2 border rounded-lg" 
          placeholder="Set Join Password" 
          value={joinCode} 
          onChange={e => setJoinCode(e.target.value)} 
        />
      )}
      <div className="flex gap-2">
        <button type="button" onClick={() => setView('LIST')} className="flex-1 p-2 bg-slate-100 rounded-lg text-sm">Cancel</button>
        <button type="submit" className="flex-1 p-2 bg-brand-600 text-white rounded-lg text-sm font-bold">Create</button>
      </div>
    </form>
  );

  const renderList = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800">My Map Layers</h3>
        <div className="flex gap-2">
          <button onClick={() => setView('JOIN')} className="p-1.5 bg-brand-50 text-brand-600 rounded-md hover:bg-brand-100" title="Join Group">
             <Search size={16} />
          </button>
          <button onClick={() => setView('CREATE')} className="p-1.5 bg-brand-50 text-brand-600 rounded-md hover:bg-brand-100" title="Create Group">
             <Plus size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={() => onGroupSelect('PUBLIC')}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
          activeGroupId === 'PUBLIC' 
            ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
            : 'bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Users size={16} />
        </div>
        <div>
          <div className="font-bold text-sm">Public Map</div>
          <div className="text-[10px] text-slate-500">Crowdsourced amenities</div>
        </div>
      </button>

      {myGroups.map(group => (
         <button
         key={group.id}
         onClick={() => onGroupSelect(group.id)}
         className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
           activeGroupId === group.id 
             ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
             : 'bg-white border-slate-200 hover:bg-slate-50'
         }`}
       >
         <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
           {group.is_private ? <Shield size={14} /> : <Users size={14} />}
         </div>
         <div>
           <div className="font-bold text-sm">{group.name}</div>
           <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{group.description || 'Private Group'}</div>
         </div>
       </button>
      ))}
    </div>
  );

  const renderJoin = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setView('LIST')} className="p-1 hover:bg-slate-100 rounded">
          <X size={16} />
        </button>
        <h3 className="font-bold text-slate-800">Join a Group</h3>
      </div>
      <input 
        className="w-full p-2 border rounded-lg text-sm" 
        placeholder="Search groups..." 
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {allGroups
          .filter(g => !myGroups.find(mg => mg.id === g.id))
          .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(group => (
          <div key={group.id} className="p-3 border rounded-xl bg-white">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm">{group.name}</span>
              {group.is_private && <Key size={14} className="text-amber-500" />}
            </div>
            {group.is_private && (
               <input 
               className="w-full p-1.5 border rounded mb-2 text-xs" 
               placeholder="Enter Join Password"
               value={inputCode}
               onChange={e => setInputCode(e.target.value)}
             />
            )}
            <button 
              onClick={() => handleJoinGroup(group)}
              className="w-full bg-slate-900 text-white text-xs py-2 rounded-lg font-semibold"
            >
              Join Group
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="absolute top-0 left-0 h-full w-full md:w-80 bg-white z-[500] shadow-xl border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-lg">My Groups</h2>
        <button onClick={onClose} className="md:hidden p-2"><X /></button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        {view === 'LIST' && renderList()}
        {view === 'CREATE' && renderCreate()}
        {view === 'JOIN' && renderJoin()}
      </div>
    </div>
  );
};

export default GroupManager;