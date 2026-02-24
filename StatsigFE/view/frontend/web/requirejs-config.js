/**
 *  RequireJS configuration for statsig module
 */
var config = {
    paths: {
        'statsig-js-cdn': 'https://cdn.jsdelivr.net/npm/@statsig/js-client@3/build/statsig-js-client+session-replay+web-analytics.min',
        'statsig': 'RightPoint_StatsigFE/js/vendor/statsig-manager'
    },
    shim: {
        'statsig-js-cdn': {
            exports: 'Statsig'
        }
    }
};
