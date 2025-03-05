import React from 'react';

const DocumentStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Documents</span>
        <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalDocuments}</span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Simplified Today</span>
        <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.simplifiedToday}</span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Saved</span>
        <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
          {Math.floor(stats.savedTime / 60)}h {stats.savedTime % 60}m
        </span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Words Simplified</span>
        <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
          {stats.wordsSimplified.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default DocumentStats;