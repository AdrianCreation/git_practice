/**
 * Statsig Manager - Proper RequireJS Integration
 */
define([
    'statsig-sdk'
], function(statsigSDK) {
    'use strict';

    console.log('Statsig Manager: Loaded SDK via RequireJS:', statsigSDK);

    var StatsigManager = {
        sdk: statsigSDK,
        isInitialized: false,
        user: null,

        /**
         * Initialize Statsig
         */
        initialize: function(clientKey, user, options) {
            var self = this;

            console.log('Statsig Manager: Initializing with SDK v3...');

            if (!this.sdk || !this.sdk.StatsigClient) {
                console.error('Statsig Manager: SDK not properly loaded. SDK:', this.sdk);
                return Promise.reject('SDK not available');
            }

            // Store user for later reference
            this.user = user;

            try {
                // Create new StatsigClient instance (SDK v3 API)
                var client = new this.sdk.StatsigClient(clientKey, user, options || {});
                self.client = client;

                // Initialize the client
                return client.initializeAsync().then(function() {
                    self.isInitialized = true;
                    console.log('Statsig Manager: Initialized successfully');

                    // Make globally available
                    window.StatsigManager = self;
                    window.statsigClient = client;
                    window.statsig = client;

                    // Broadcast statsig:ready event for GTM integration
                    try {
                        window.dispatchEvent(new CustomEvent("statsig:ready", {
                            detail: { client: client }
                        }));
                        console.log('Statsig Manager: Broadcasted statsig:ready event');
                    } catch (e) {
                        console.error('Statsig Manager: Failed to broadcast event', e);
                    }

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
         * Check feature gate
         */
        checkGate: function(gateName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return false;
            }
            return this.client.checkGate(gateName);
        },

        /**
         * Get dynamic config
         */
        getConfig: function(configName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return {};
            }
            return this.client.getDynamicConfig(configName);
        },

        /**
         * Log event
         */
        logEvent: function(eventName, value, metadata) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return;
            }
            // SDK v3 uses an object for logEvent
            this.client.logEvent({
                eventName: eventName,
                value: value,
                metadata: metadata
            });
        },

        /**
         * Get experiment data
         */
        getExperiment: function(experimentName) {
            if (!this.isInitialized || !this.client) {
                console.warn('Statsig Manager: Not initialized');
                return null;
            }
            return this.client.getExperiment(experimentName);
        }
    };

    return StatsigManager;
});
