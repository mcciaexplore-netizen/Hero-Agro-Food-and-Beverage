import React, { useState } from 'react';
import Layout from './components/Layout';
import SurveyForm from './components/SurveyForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<'survey' | 'dashboard'>('survey');

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'survey' ? (
        <SurveyForm />
      ) : (
        <Dashboard />
      )}
    </Layout>
  );
}
