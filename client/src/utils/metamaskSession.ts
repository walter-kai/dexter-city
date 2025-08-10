/**
 * Utility functions for managing MetaMask session state
 * Ensures fresh authentication without unwanted persistence
 */

export const clearMetaMaskSession = () => {
  try {
    // List of known MetaMask SDK storage keys
    const metamaskKeys = [
      'metamask-sdk',
      'MM_SDK',
      'sdk-comm',
      '_MetaMaskSDK',
      'metamask_connection',
      'ethereum-provider',
    ];

    // Clear localStorage
    metamaskKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage
    metamaskKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Clear any keys that contain metamask or sdk (case insensitive)
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && /metamask|sdk|mm_/i.test(key)) {
        localStorage.removeItem(key);
      }
    }

    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && /metamask|sdk|mm_/i.test(key)) {
        sessionStorage.removeItem(key);
      }
    }

    console.log('MetaMask session cleared - fresh authentication required');
  } catch (error) {
    console.warn('Could not clear MetaMask session:', error);
  }
};

export const logStorageContents = () => {
  console.log('=== Current Browser Storage ===');
  
  console.log('LocalStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`  ${key}: ${localStorage.getItem(key)?.substring(0, 100)}...`);
    }
  }
  
  console.log('SessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      console.log(`  ${key}: ${sessionStorage.getItem(key)?.substring(0, 100)}...`);
    }
  }
  
  console.log('=== End Storage Contents ===');
};

export const checkForMetaMaskState = () => {
  const metamaskKeys = [];
  
  // Check localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && /metamask|sdk|mm_/i.test(key)) {
      metamaskKeys.push(`localStorage.${key}`);
    }
  }
  
  // Check sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && /metamask|sdk|mm_/i.test(key)) {
      metamaskKeys.push(`sessionStorage.${key}`);
    }
  }
  
  if (metamaskKeys.length > 0) {
    console.warn('Found persistent MetaMask state:', metamaskKeys);
    return true;
  }
  
  return false;
};
