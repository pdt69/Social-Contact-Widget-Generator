import React, { useState } from 'react';
import type { WidgetConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import Configurator from './components/Configurator';
import Preview from './components/Preview';
import CodeOutput from './components/CodeOutput';

const App: React.FC = () => {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800/50 shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Social Contact Widget Generator
            </h1>
            <a 
              href="https://github.com/your-repo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
            </a>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Configurator config={config} setConfig={setConfig} />
          </div>
          <div className="lg:col-span-3 space-y-8">
            <Preview config={config} />
            <CodeOutput config={config} />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;