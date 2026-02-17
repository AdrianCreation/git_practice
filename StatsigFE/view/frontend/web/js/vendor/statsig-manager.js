/**
 * Statsig Manager - Modern SDK Integration
 * Requires Statsig SDK to be loaded via CDN script tag:
 * <script src="https://cdn.jsdelivr.net/npm/@statsig/js-client@3/build/statsig-js-client+session-replay+web-analytics.min.js" crossorigin="anonymous"></script>
 */
define([], function() {
    'use strict';

    var StatsigManager = {
        client: null,
        isInitialized: false,
        user: null,

        /**
         * Initialize Statsig with the modern SDK
         * @param {string} clientKey - Your Statsig client SDK key
         * @param {Object} user - User object with userID and other properties
         * @param {Object} options - Statsig client options
         * @returns {Promise}
         */
        initialize: function(clientKey, user, options) {
            var self = this;

            // Check if Statsig SDK is loaded via CDN
            if (typeof window.Statsig === 'undefined' || !window.Statsig.StatsigClient) {
                console.error('Statsig Manager: Statsig SDK not loaded. Please include the CDN script tag.');
                return Promise.reject('Statsig SDK not available');
            }

            try {
                // Create a new StatsigClient instance
                var StatsigClient = window.Statsig.StatsigClient;
                this.client = new StatsigClient(clientKey, user, options || {});
                this.user = user;

                console.log('Statsig Manager: Initializing SDK...');

                // Initialize the client
                return this.client.initializeAsync().then(function() {
                    self.isInitialized = true;
                    console.log('Statsig Manager: Initialized successfully');

                    // Broadcast statsig:ready event for GTM integration
                    try {
                        window.dispatchEvent(new CustomEvent('statsig:ready', {
                            detail: {
                                statsig: self.client,
                                manager: self
                            }
                        }));
                        console.log('Statsig Manager: Broadcasted statsig:ready event');
                    } catch (e) {
                        console.warn('Statsig Manager: Failed to broadcast statsig:ready event', e);
                    }

                    // Make globally available
                    window.StatsigManager = self;
                    window.statsigClient = self.client;

                    return self;
                }).catch(function(error) {
                    console.error('Statsig Manager: Initialization failed', error);
                    throw error;
                });
            } catch (error) {
                console.error('Statsig Manager: Failed to create client', error);
                return Promise.reject(error);
            }
        },

        /**
         * Update user and fetch new values
         * @param {Object} user - Updated user object
         * @returns {Promise}
         */
        updateUser: function(user) {
            var self = this;
            if (!this.client) {
                console.warn('Statsig Manager: Client not initialized');
                return Promise.reject('Client not initialized');
            }

            this.user = user;
            return this.client.updateUserAsync(user).then(function() {
                console.log('Statsig Manager: User updated successfully');
                return self;
            }).catch(function(error) {
                console.error('Statsig Manager: User update failed', error);
                throw error;
            });
        },

        /**
         * Check feature gate
         * @param {string} gateName - Name of the gate to check
         * @returns {boolean}
         */
        checkGate: function(gateName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return false;
            }
            return this.client.checkGate(gateName);
        },

        /**
         * Get feature gate with details
         * @param {string} gateName - Name of the gate
         * @returns {Object} Gate object with value and details
         */
        getFeatureGate: function(gateName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return { value: false, details: { reason: 'Uninitialized' } };
            }
            return this.client.getFeatureGate(gateName);
        },

        /**
         * Get dynamic config
         * @param {string} configName - Name of the config
         * @returns {Object} Config object with get() method
         */
        getDynamicConfig: function(configName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return {
                    value: {},
                    get: function(key, fallback) { return fallback; }
                };
            }
            return this.client.getDynamicConfig(configName);
        },

        /**
         * Get dynamic config (legacy alias)
         * @deprecated Use getDynamicConfig instead
         */
        getConfig: function(configName) {
            return this.getDynamicConfig(configName);
        },

        /**
         * Get experiment
         * @param {string} experimentName - Name of the experiment
         * @returns {Object} Experiment object with get() method and value
         */
        getExperiment: function(experimentName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return {
                    value: {},
                    get: function(key, fallback) { return fallback; }
                };
            }
            return this.client.getExperiment(experimentName);
        },

        /**
         * Get layer
         * @param {string} layerName - Name of the layer
         * @returns {Object} Layer object with get() method
         */
        getLayer: function(layerName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return {
                    get: function(key, fallback) { return fallback; }
                };
            }
            return this.client.getLayer(layerName);
        },

        /**
         * Log event
         * @param {string|Object} eventNameOrObject - Event name or event object
         * @param {*} value - Optional event value
         * @param {Object} metadata - Optional event metadata
         */
        logEvent: function(eventNameOrObject, value, metadata) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return;
            }

            // Support both old and new API styles
            if (typeof eventNameOrObject === 'string') {
                // Old style: logEvent(name, value, metadata)
                this.client.logEvent({
                    eventName: eventNameOrObject,
                    value: value,
                    metadata: metadata
                });
            } else {
                // New style: logEvent({ eventName, value, metadata })
                this.client.logEvent(eventNameOrObject);
            }
        },

        /**
         * Get client context (includes stableID)
         * @returns {Object} Context with stableID and other info
         */
        getContext: function() {
            if (!this.client) {
                console.warn('Statsig Manager: Client not initialized');
                return {};
            }
            return this.client.getContext();
        },

        /**
         * Shutdown the SDK and flush events
         * @returns {Promise}
         */
        shutdown: function() {
            if (!this.client) {
                console.warn('Statsig Manager: Client not initialized');
                return Promise.resolve();
            }

            console.log('Statsig Manager: Shutting down...');
            return this.client.shutdown().then(function() {
                console.log('Statsig Manager: Shutdown complete');
            });
        }
    };

    return StatsigManager;
});
