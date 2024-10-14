/**
 * Get a test message
 * @param {ObjectId} id - just an example message to show how it should look
 * @returns {string} The message we want to return
 */
const getTestMessage = async (): Promise<string> => {
  return "The message is hello!";
};
export default {
  getTestMessage,
};
