import React, { useState } from 'react';
import { Database, Server, Layers, Clock, Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import databaseApi from '../services/databaseApi';

export const Sidebar = ({
  recentQueries = [],
  onSelectQuery,
  isOpen = true,
  onToggle,
}) => {
  const { databases, activeDatabase, setActiveDatabase, refreshDatabases } = useAuth();
  const [showAddDb, setShowAddDb] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const handleAddDatabase = async (e) => {
    e.preventDefault();
    if (!newDbName.trim()) return;
    setIsAdding(true);
    setAddError('');
    try {
      await databaseApi.addDatabase(newDbName.trim());
      setNewDbName('');
      setShowAddDb(false);
      await refreshDatabases();
      setActiveDatabase(newDbName.trim());
    } catch (err) {
      setAddError(err.response?.data?.error || err.message || 'Failed to add database');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <aside
      className={`w-64 shrink-0 bg-white border-r border-border flex flex-col h-[calc(100vh-3.25rem)] overflow-y-auto transition-all duration-200 ${
        isOpen ? 'block' : 'hidden lg:block'
      }`}
    >
      {/* Active Database Meta */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Connection Info
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-success">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            Connected
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Environment */}
          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-secondary">Environment</span>
            <span className="font-mono text-text-primary font-medium px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-[11px]">
              staging
            </span>
          </div>

          {/* Active Database Selector */}
          <div className="py-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-text-secondary">Active Database</span>
              <button
                type="button"
                onClick={() => setShowAddDb(!showAddDb)}
                className="text-[11px] text-text-secondary hover:text-text-primary flex items-center gap-0.5 font-medium"
                title="Register another database under current credentials"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {showAddDb && (
              <form onSubmit={handleAddDatabase} className="mb-2 p-2 bg-surface-muted rounded border border-border">
                <input
                  type="text"
                  placeholder="database_name"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  className="w-full px-2 py-1 text-xs border rounded bg-white text-text-primary border-border focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  autoFocus
                />
                {addError && <p className="text-[10px] text-status-error mt-1">{addError}</p>}
                <div className="flex justify-end gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddDb(false); setAddError(''); }}
                    className="px-2 py-0.5 text-[11px] text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || !newDbName.trim()}
                    className="px-2 py-0.5 text-[11px] bg-brand text-white rounded hover:bg-brand-hover disabled:opacity-50"
                  >
                    {isAdding ? 'Adding...' : 'Save'}
                  </button>
                </div>
              </form>
            )}

            {databases && databases.length > 0 ? (
              <select
                value={activeDatabase || ''}
                onChange={(e) => setActiveDatabase(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-surface-muted text-text-primary font-mono font-medium border border-border rounded focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {databases.map((db) => (
                  <option key={db._id || db.dbName} value={db.dbName}>
                    {db.dbName}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-mono text-text-primary text-xs px-2.5 py-1.5 bg-surface-muted rounded border border-border">
                {activeDatabase || 'default'}
              </div>
            )}
          </div>

          {/* Engine Type */}
          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-secondary">Engine</span>
            <span className="text-text-primary font-medium">SQL / Relational</span>
          </div>
        </div>
      </div>

      {/* Query History Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
          <span>Recent Questions</span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">
            {recentQueries.length}
          </span>
        </div>

        {recentQueries.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-xs">
            No questions asked yet in this session.
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto max-h-[340px] pr-1">
            {recentQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuery(item.query)}
                className="w-full text-left p-2 rounded border border-border-subtle bg-surface-muted hover:bg-surface-subtle hover:border-border transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono text-text-muted">
                    {item.timestamp || 'Just now'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-text-muted group-hover:text-text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xs text-text-primary line-clamp-2 break-words leading-snug">
                  {item.query}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Security Note Footer */}
      <div className="p-3 border-t border-border bg-surface-muted text-[11px] text-text-muted flex items-center gap-2">
        <Server className="w-3.5 h-3.5 shrink-0" />
        <span>Credentials encrypted & isolated</span>
      </div>
    </aside>
  );
};

export default Sidebar;
