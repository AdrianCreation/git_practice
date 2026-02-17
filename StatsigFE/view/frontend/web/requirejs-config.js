/**
 *  RequireJS configuration for statsig module
 */
var config = {
    paths: {
        'statsig-sdk': "https://cdn.jsdelivr.net/npm/@statsig/js-client@3/build/statsig-js-client+session-replay+web-analytics.min.js?apikey=YOUR_CLIENT_KEY"
    },
    shim: {
        'statsig-sdk': {
            exports: 'statsig',
            init: function() {
                // Ensure the global statsig is available 
                return window.statsig || window.Statsig || this.statsig;
            }
        }
    },
    map: {
        '*': {
            'statsig-sdk': 'RightPoint_StatsigFE/js/statsig_manager'
        }
    }
};