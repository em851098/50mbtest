// Configuration
const config = {
  loginURL: 'https://dppj1ypy65ita.cloudfront.net/v1/user/login',
    updateURL: 'https://dppj1ypy65ita.cloudfront.net/v1/user/user-count',
      walletAddress: '0x7d9fbd50047db847d65dbb31f29df46dec708147', // Updated wallet address
        requestDelay: 100, // 10 seconds between updates
          retryDelay: 10000,   // 10 seconds after an error
            maxSlaps: 300,
              minSlaps: 299 // Minimum slap count updated
              };

              let authToken = null;

              // Logging and Tracking
              const requestLog = {
                successful: [],
                  failed: []
                  };

                  // Utility Functions
                  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

                  const logRequest = (type, details = {}) => {
                    const timestamp = new Date();
                      const logEntry = { timestamp: timestamp.toISOString(), type, ...details };

                        if (type === 'successful') {
                            requestLog.successful.push(logEntry);
                              } else {
                                  requestLog.failed.push(logEntry);
                                    }

                                      console.log(`[${timestamp.toISOString()}] ${type.toUpperCase()}:`, details);
                                      };

                                      // Random slapCount generator
                                      const generateSlapCount = () => {
                                        return Math.floor(Math.random() * (config.maxSlaps - config.minSlaps + 1)) + config.minSlaps;
                                        };

                                        // Login Function
                                        async function login() {
                                          try {
                                              const response = await fetch(config.loginURL, {
                                                    method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ walletAddress: config.walletAddress })
                                                                    });

                                                                        const data = await response.json();
                                                                            if (response.ok && data.status === 'SUCCESS') {
                                                                                  authToken = data.data.token;
                                                                                        logRequest('successful', { action: 'login', message: 'Login successful' });
                                                                                            } else {
                                                                                                  throw new Error(`Login failed: ${data.message}`);
                                                                                                      }
                                                                                                        } catch (error) {
                                                                                                            logRequest('failed', { action: 'login', error: error.message });
                                                                                                                throw error;
                                                                                                                  }
                                                                                                                  }

                                                                                                                  // Update Function
                                                                                                                  async function sendUpdate() {
                                                                                                                    try {
                                                                                                                        const slapCount = generateSlapCount();

                                                                                                                            const response = await fetch(config.updateURL, {
                                                                                                                                  method: 'PUT',
                                                                                                                                        headers: {
                                                                                                                                                'Authorization': `Bearer ${authToken}`,
                                                                                                                                                        'Content-Type': 'application/json'
                                                                                                                                                              },
                                                                                                                                                                    body: JSON.stringify({ slapCount })
                                                                                                                                                                        });

                                                                                                                                                                            const data = await response.json();

                                                                                                                                                                                if (response.ok && data.status === 'SUCCESS') {
                                                                                                                                                                                      logRequest('successful', {
                                                                                                                                                                                              action: 'update',
                                                                                                                                                                                                      slapCountSent: slapCount,
                                                                                                                                                                                                              totalUserSlaps: data.data.userData.slapCount,
                                                                                                                                                                                                                      contribution: ((data.data.userData.slapCount / data.data.leaderboardData.count) * 100).toFixed(2) + '%',
                                                                                                                                                                                                                              isActive: data.data.userData.isActive ? 'Active' : 'Inactive'
                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                              throw new Error(`Update failed: ${data.message}`);
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                    } catch (error) {
                                                                                                                                                                                                                                                        if (error.message.includes('not authorized')) {
                                                                                                                                                                                                                                                              logRequest('failed', { action: 'update', message: 'Token expired, re-authenticating...' });
                                                                                                                                                                                                                                                                    await login();
                                                                                                                                                                                                                                                                          await sendUpdate();
                                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                                    logRequest('failed', { action: 'update', error: error.message });
                                                                                                                                                                                                                                                                                          throw error;
                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                // Execution Loop
                                                                                                                                                                                                                                                                                                async function executeUpdates() {
                                                                                                                                                                                                                                                                                                  let cycle = 0;

                                                                                                                                                                                                                                                                                                    while (true) {
                                                                                                                                                                                                                                                                                                        try {
                                                                                                                                                                                                                                                                                                              console.log(`\n--- Cycle ${++cycle}: Starting Updates ---`);
                                                                                                                                                                                                                                                                                                                    for (let i = 0; i < 6; i++) {
                                                                                                                                                                                                                                                                                                                            await sendUpdate();
                                                                                                                                                                                                                                                                                                                                    await sleep(config.requestDelay);
                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                              } catch (error) {
                                                                                                                                                                                                                                                                                                                                                    console.error('Error during execution:', error.message);
                                                                                                                                                                                                                                                                                                                                                          console.log(`Retrying in ${config.retryDelay / 1000} seconds...`);
                                                                                                                                                                                                                                                                                                                                                                await sleep(config.retryDelay);
                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                                                                      // Main Execution
                                                                                                                                                                                                                                                                                                                                                                      (async function main() {
                                                                                                                                                                                                                                                                                                                                                                        try {
                                                                                                                                                                                                                                                                                                                                                                            console.log('Starting the process...');
                                                                                                                                                                                                                                                                                                                                                                                await login();
                                                                                                                                                                                                                                                                                                                                                                                    await executeUpdates();
                                                                                                                                                                                                                                                                                                                                                                                      } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                          console.error('Critical error. Exiting:', error.message);
                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                            })();