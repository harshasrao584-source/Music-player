import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import BottomPlayer from '../components/BottomPlayer';
import QueuePanel from '../components/QueuePanel';
import LyricsPanel from '../components/LyricsPanel';
import FullscreenPlayer from '../pages/FullscreenPlayer';

const MainLayout = ({ children }) => {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const toggleQueue = () => {
    setIsQueueOpen(!isQueueOpen);
    if (isLyricsOpen) setIsLyricsOpen(false); // close other panel
  };

  const toggleLyrics = () => {
    setIsLyricsOpen(!isLyricsOpen);
    if (isQueueOpen) setIsQueueOpen(false); // close other panel
  };

  // Called when a playlist is created in sidebar to trigger re-renders
  const handlePlaylistCreated = () => {
    setSidebarRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-hidden font-outfit">
      
      {/* Top Body container (Sidebar + Content + Panels) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar key={sidebarRefreshKey} onCreatePlaylistSuccess={handlePlaylistCreated} />

        {/* Center Main Content Scroll Frame */}
        <main className="flex-1 overflow-y-auto bg-linear-to-b from-transparent to-black/5 dark:to-black/20 p-6 md:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            {children}
          </div>
        </main>

        {/* Right side panels */}
        <QueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
        <LyricsPanel isOpen={isLyricsOpen} onClose={() => setIsLyricsOpen(false)} />
      </div>

      {/* Bottom Audio Controller Bar */}
      <BottomPlayer
        toggleQueue={toggleQueue}
        toggleLyrics={toggleLyrics}
        isQueueOpen={isQueueOpen}
        isLyricsOpen={isLyricsOpen}
        onFullscreen={() => setIsFullscreen(true)}
      />

      {/* Overlay Full-screen Player view */}
      <FullscreenPlayer isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} />
      
    </div>
  );
};

export default MainLayout;
