/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "placehold.co",
      "images.unsplash.com",
      "img.etimg.com",
      "s.yimg.com",
      "media.cnn.com",
      "image.cnbcfm.com",
      "www.ft.com",
      "images.wsj.net",
      "ichef.bbci.co.uk",
      "static.reuters.com",
      "cdn.cnn.com",
      "assets.bwbx.io",
      "www.investors.com",
      "static01.nyt.com",
      "www.nasdaq.com",
      "a.c-dn.net",
      "static.seekingalpha.com",
      "s1.reutersmedia.net",
      "s2.reutersmedia.net",
      "s3.reutersmedia.net",
      "s4.reutersmedia.net",
      "thumbor.forbes.com",
      "www.americanbankingnews.com",
      "www.marketbeat.com",
      "biztoc.com",
      "nypost.com",
      "wp-content.nypost.com",
      "werd.io",
      "english.khabarhub.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nypost.com",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "werd.io",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "english.khabarhub.com",
        pathname: "/wp-content/**",
      },
    ],
  },
};

module.exports = nextConfig;
