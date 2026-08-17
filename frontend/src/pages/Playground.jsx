import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import queryApi from '../services/queryApi';
import { extractErrorMessage } from '../services/apiClient';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import ResultTable from '../components/ResultTable';

export const Playground = () => {
  const { activeDatabase } = useAuth();

  // Query editor state
  const [currentQuery, setCurrentQuery] = useState('SELECT * FROM users LIMIT 10;');
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [executionDuration, setExecutionDuration] = useState(null);

  // In-memory query history
  const [recentQueries, setRecentQueries] = useState([
    { query: 'SELECT * FROM users LIMIT 10;', timestamp: 'Sample' },
    { query: 'SELECT COUNT(*) AS total FROM users;', timestamp: 'Sample' },
  ]);

  const handleRunQuery = async () => {
    const trimmed = currentQuery.trim();
    if (!trimmed || isExecuting) return;

    if (!activeDatabase) {
      setQueryError('No active database selected. Please select or connect a database.');
      return;
    }

    setIsExecuting(true);
    setQueryError(null);
    setQueryResults(null);
    setExecutionDuration(null);

    const startTime = performance.now();

    try {
      const response = await queryApi.executeQuery({
        dbName: activeDatabase,
        query: trimmed,
      });

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      setExecutionDuration(durationMs);

      // Backend returns { success: true, data: rows }
      const rows = response?.data !== undefined ? response.data : response;
      setQueryResults(rows);

      // Add to recent queries (prevent duplicate consecutive entries)
      setRecentQueries((prev) => {
        const filtered = prev.filter((item) => item.query !== trimmed);
        return [
          {
            query: trimmed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...filtered,
        ].slice(0, 20); // Keep max 20
      });
    } catch (err) {
      const endTime = performance.now();
      setExecutionDuration(Math.round(endTime - startTime));
      
      const errorMsg = extractErrorMessage(
        err,
        'Failed to execute SQL query. Please verify your syntax.'
      );
      setQueryError(errorMsg);
      setQueryResults(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectRecentQuery = (sqlString) => {
    setCurrentQuery(sqlString);
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col antialiased">
      {/* Top Application Header */}
      <Navbar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Connection & Query History Sidebar */}
        <Sidebar
          recentQueries={recentQueries}
          onSelectQuery={handleSelectRecentQuery}
        />

        {/* Editor & Results Panels */}
        <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto lg:overflow-hidden h-[calc(100vh-3.25rem)]">
          {/* Left Panel: SQL Code Editor (48% width on desktop) */}
          <section className="w-full lg:w-[48%] h-[380px] lg:h-full shrink-0 flex flex-col">
            <QueryEditor
              query={currentQuery}
              onChange={setCurrentQuery}
              onRun={handleRunQuery}
              isLoading={isExecuting}
              disabled={!activeDatabase}
            />
          </section>

          {/* Right Panel: Query Results (52% width on desktop) */}
          <section className="w-full lg:w-[52%] min-h-[380px] lg:h-full flex-1 flex flex-col">
            <ResultTable
              results={queryResults}
              isLoading={isExecuting}
              error={queryError}
              executionTime={executionDuration}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Playground;
