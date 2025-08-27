import { FingerprintsConfig } from './types';

export const fingerprintsConfig: FingerprintsConfig = {
  fingerprints: {
    algolia: {
      scripts: {
        src: [
          "https://cdn.jsdelivr.net/npm/algoliasearch@4.25.2/dist/algoliasearch-lite.esm.browser.js",
          "https://cdn.jsdelivr.net/npm/algoliasearch@4.14.2/dist/algoliasearch-lite.umd.js",
          "https://cdn.jsdelivr.net/npm/algoliasearch@4.25.2/dist/algoliasearch.esm.browser.js",
          "https://cdn.jsdelivr.net/npm/@algolia/client-abtesting@5.35.0/dist/builds/browser.umd.js",
          "https://cdn.jsdelivr.net/npm/search-insights@2.2.1",
          "https://cdn.jsdelivr.net/npm/instantsearch.js@4.49.1/dist/instantsearch.production.min.js",
          "https://cdn.jsdelivr.net/npm/@algolia/autocomplete-js",
          "https://cdn.jsdelivr.net/npm/@algolia/autocomplete-plugin-query-suggestions",
          "https://cdn.jsdelivr.net/npm/@algolia/autocomplete-plugin-algolia-insights",
          "https://cdn.jsdelivr.net/npm/@algolia/autocomplete-plugin-redirect-url",
          "https://cdn.jsdelivr.net/npm/search-insights@2.17.2/dist/search-insights.min.js",
          "https://cdn-us.algoliaradar.com/radar.js"
        ],
        ids: ["__NEXT_DATA__"],
        keywords: [
          "ALGOLIA_SEARCH_API_KEY",
          "ALGOLIA_APPLICATION_ID",
          "algolia",
          "algolia_app_id",
          "algolia_api_key"
        ]
      },
      apiRequestsURLs: [
        "https://insights.algolia.io",
        "https://insights.us.algolia.io",
        "https://insights.de.algolia.io",
        "https://qg73n610r9-dsn.algolia.net"
      ],
      windowVariables: [
        "__algolia",
        "algolia",
        "algoliaPlp",
        "AnalyticsLogConfiguration",
        "algaliaShopify",
        "algoliasearch",
        "AlgoliaAnalytics",
        "AlgoliaAnalyticsObject",
        "ALGOLIA_INSIGHTS_SRC"
      ],
      dataAttributes: [
        "data-algolia-*",
        "data-algolia-index",
        "data-insights-index",
        "data-insights-object-id",
        "data-insights-query-id",
        "data-insights-filter",
        "data-insights-position"
      ],
      cookies: ["_ALGOLIA"],
      headTags: [
        {
          tag: "link",
          href: "https://RT8ZK55N9N-dsn.algolia.net",
          rel: "preconnect"
        }
      ],
      classesList: [
        "ais-Panel",
        "ais-Panel-header",
        "ais-Panel-body",
        "ais-RefinementList",
        "ais-RefinementList-list",
        "ais-RefinementList-item",
        "ais-RefinementList-label",
        "ais-RefinementList-checkbox",
        "ais-RefinementList-labelText",
        "ais-RefinementList-count",
        "ais-SearchBox",
        "ais-SearchBox-form",
        "ais-SearchBox-input",
        "ais-SearchBox-submit",
        "ais-SearchBox-submitIcon",
        "ais-SearchBox-reset",
        "ais-SearchBox-resetIcon",
        "ais-SearchBox-loadingIndicator",
        "ais-SearchBox-loadingIcon",
        "ais-Hits",
        "ais-Hits-list",
        "ais-Hits-item",
        "ais-Highlight",
        "ais-Highlight-nonHighlighted",
        "ais-Pagination",
        "ais-Pagination-list",
        "ais-Pagination-item",
        "ais-Pagination-item--disabled",
        "ais-Pagination-item--firstPage",
        "ais-Pagination-link",
        "ais-Pagination-item--previousPage",
        "ais-Pagination-item--page",
        "ais-Pagination-item--selected",
        "ais-Pagination-item--nextPage",
        "ais-Pagination-item--lastPage",
        "ais-TrendingItems",
        "ais-TrendingItems-title",
        "ais-Carousel",
        "ais-Carousel-navigation",
        "ais-Carousel-navigation--previous",
        "ais-Carousel-list",
        "ais-TrendingItems-list",
        "ais-Carousel-item",
        "ais-TrendingItems-item",
        "ais-Carousel-navigation--next"
      ]
    }
  }
};
