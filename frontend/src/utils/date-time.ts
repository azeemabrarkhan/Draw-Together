export const getCurrentTimeStamp = () => {
  const currentDateObj = new Date();
  return `${currentDateObj.toLocaleDateString()}-${currentDateObj.toLocaleTimeString()}`;
};
