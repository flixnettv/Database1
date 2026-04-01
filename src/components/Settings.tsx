import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bot, ToggleLeft, ToggleRight, Languages, Brain, Plus, Trash2 } from 'lucide-react';
import { skillService, Skill } from '../services/skills';

export const Settings = ({ user, lang, setLang, memoryOption, setMemoryOption }) => {
  if (!user) return null;
  const [name, setName] = useState(user.name);
  const [agents, setAgents] = useState([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  useEffect(() => {
    fetch(`/api/user/agents?user_id=${user.id}`).then(res => res.json()).then((data: any) => setAgents(data.agents || []));
    if (memoryOption === 'skills') {
      skillService.getSkills(user.id).then(setSkills);
    }
  }, [user.id, memoryOption]);

  const toggleAgent = (agent_id, is_active) => {
    fetch('/api/user/toggle-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, agent_id, is_active: !is_active })
    }).then(() => {
      setAgents(prev => prev.map(a => a.agent_id === agent_id ? {...a, is_active: !is_active} : a));
    });
  };

  const addSkill = async () => {
    if (!newSkillName.trim()) return;
    const skill = await skillService.addSkill(user.id, newSkillName, newSkillDesc);
    if (skill) {
      setSkills([...skills, skill]);
      setNewSkillName('');
      setNewSkillDesc('');
    }
  };

  const deleteSkill = async (id: string) => {
    await skillService.deleteSkill(id);
    setSkills(skills.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Settings</h2>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Name</label>
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
        />
        <p className="text-xs text-white/50">PIN Expiry: {user.pin_expiry || 'Never'}</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Languages size={16} /> Language
        </label>
        <select 
          value={lang}
          onChange={(e) => setLang(e.target.value as 'en' | 'ar')}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Brain size={16} /> Memory
        </label>
        <select 
          value={memoryOption}
          onChange={(e) => setMemoryOption(e.target.value as 'standard' | 'skills')}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
        >
          <option value="standard">Standard</option>
          <option value="skills">Skills</option>
        </select>
      </div>

      {memoryOption === 'skills' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          <div className="flex gap-2">
            <input 
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill Name"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            />
            <input 
              value={newSkillDesc}
              onChange={(e) => setNewSkillDesc(e.target.value)}
              placeholder="Description"
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
            />
            <button onClick={addSkill} className="p-2 bg-blue-500 rounded-xl text-white">
              <Plus size={20} />
            </button>
          </div>
          {skills.map(skill => (
            <div key={skill.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-bold">{skill.name}</p>
                <p className="text-xs text-white/50">{skill.description}</p>
              </div>
              <button onClick={() => deleteSkill(skill.id)} className="text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Assigned Agents</h3>
        {agents.map(agent => (
          <div key={agent.agent_id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
            <span>{agent.agents.name}</span>
            <button onClick={() => toggleAgent(agent.agent_id, agent.is_active)}>
              {agent.is_active ? <ToggleRight className="text-emerald-400" /> : <ToggleLeft className="text-white/40" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
