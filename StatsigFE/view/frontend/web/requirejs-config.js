/**
 * RequireJS configuration for Statsig module
 */
var config = {
    paths: {
        'statsig-sdk': 'https://cdn.jsdelivr.net/npm/@statsig/js-client@3/build/statsig-js-client.min.js?apikey=client-Oz4jRziTwPJa9Bo8jf7f4kLEp3sERxQi4UWdXdO4aFK'

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
            'statsig': 'Rightpoint_StatsigFE/js/statsig-manager'
        }
    }
};
