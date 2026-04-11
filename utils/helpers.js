// Helper functions for the project
const formatResponse = (status, message, data = null) => {
  return {
    status,
    message,
    data,
    timestamp: new Date()
  };
};

module.exports = {
  formatResponse,
};
