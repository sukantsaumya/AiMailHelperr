import React, { useState } from 'react';
import { Layout } from './frontend/components/Layout';
import { InboxPage } from './frontend/pages/Inbox';
import { EmailDetailPage } from './frontend/pages/EmailDetail';
import { PromptBrainPage } from './frontend/pages/PromptBrain';

export default function App() {
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setCurrentView('detail');
  };

  const handleBackToInbox = () => {
    setSelectedEmail(null);
    setCurrentView('inbox');
  };

  return (
    <Layout
      currentView={currentView === 'detail' ? 'inbox' : currentView}
      onNavigate={setCurrentView}
    >
      {currentView === 'inbox' && (
        <InboxPage onSelectEmail={handleSelectEmail} />
      )}
      {currentView === 'detail' && selectedEmail && (
        <EmailDetailPage email={selectedEmail} onBack={handleBackToInbox} />
      )}
      {currentView === 'brain' && (
        <PromptBrainPage />
      )}
    </Layout>
  );
}