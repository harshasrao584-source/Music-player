export const formatTime = (secs) => {
  if (isNaN(secs) || secs === null || secs === undefined) return '0:00';
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
