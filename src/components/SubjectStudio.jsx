import React, { useEffect } from 'react';
import { Cuboid } from 'lucide-react';
import './SubjectStudio.css';

export default function SubjectStudio({ modelUrl }) {
  useEffect(() => {
    if (!customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  if (!modelUrl) {
    return (
      <div className="subject-studio-empty">
        <Cuboid size={48} className="empty-icon" />
        <p>Waiting for 3D subject...</p>
        <p className="empty-subtext">When you mention a known physical object (like 'heart' or 'earth'), it will appear here dynamically.</p>
      </div>
    );
  }

  return (
    <div className="subject-studio-container">
      <model-viewer
        src={modelUrl}
        auto-rotate
        camera-controls
        ar
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#f8f9fa' }}
      ></model-viewer>
    </div>
  );
}
