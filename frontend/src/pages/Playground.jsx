import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import queryApi from '../services/queryApi';
import { extractErrorMessage } from '../services/apiClient';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NLQueryInput from '../components/NLQueryInput';
import GeneratedSQL from '../components/GeneratedSQL';
import ResultTable from '../components/ResultTable';

export const Playground = () => {
  const { activeDatabase } = useAuth();

  // Natural language query state
  const [nlQuery, setNlQuery] = useState('');

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState(null);
  const [generatedSQL, setGeneratedSQL] = useState(null);
  const [schemaContext, setSchemaContext] = useState([]);
  const [queryError, setQueryError] = useState(null);
  const [executionDuration, setExecutionDuration] = useState(null);

  // In-memory query history
  const [recentQueries, setRecentQueries] = useState([]);

  const handleAskQuestion = async (question) => {
    if (!question.trim() || isExecuting) return;

    if (!activeDatabase) {
      setQueryError('No active database selected. Please select or connect a database.');
      return;
    }

    setIsExecuting(true);
    setQueryError(null);
    setQueryResults(null);
    setGeneratedSQL(null);
    setSchemaContext([]);
    setExecutionDuration(null);

    const startTime = performance.now();

    try {
      const response = await queryApi.executeQuery({
        dbName: activeDatabase,
        query: question,
      });

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      setExecutionDuration(durationMs);

      // Backend returns { success: true, data: rows, schemaContext: [...], sqlQuery: string }
      const rows = response?.data !== undefined ? response.data : response;
      setQueryResults(rows);
      setGeneratedSQL(response?.sqlQuery || null);
      setSchemaContext(response?.schemaContext || []);

      // Add to recent questions (prevent duplicate consecutive entries)
      setRecentQueries((prev) => {
        const filtered = prev.filter((item) => item.query !== question);
        return [
          {
            query: question,
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
        'Failed to process your question. Please try rephrasing or check your database connection.'
      );
      setQueryError(errorMsg);
      setQueryResults(null);
      setGeneratedSQL(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectRecentQuery = (queryString) => {
    setNlQuery(queryString);
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

        {/* Main Content — NL Input + Generated SQL + Results */}
        <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto h-[calc(100vh-3.25rem)]">
          {/* Natural Language Input */}
          <section className="shrink-0">
            <NLQueryInput
              onSubmit={handleAskQuestion}
              isLoading={isExecuting}
              disabled={!activeDatabase}
              initialValue={nlQuery}
            />
          </section>

          {/* Generated SQL Display */}
          {generatedSQL && (
            <section className="shrink-0">
              <GeneratedSQL sqlQuery={generatedSQL} />
            </section>
          )}

          {/* Query Results */}
          <section className="flex-1 min-h-[300px] flex flex-col">
            <ResultTable
              results={queryResults}
              schemaContext={schemaContext}
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
