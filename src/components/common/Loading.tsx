import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false }) => {
  const loadingContent = (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce" />
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce [animation-delay:-.3s]" />
      <div className="w-4 h-4 bg-primary-600 rounded-full animate-bounce [animation-delay:-.5s]" />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
};

export default Loading; 