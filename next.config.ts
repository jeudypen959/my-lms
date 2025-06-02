/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true, // ✅ THIS is required for static export to work
    domains: [
      'images.unsplash.com',
      'thefusioneer.com',
      'static.wixstatic.com',
      'firebasestorage.googleapis.com',
      'example.com',
      'via.placeholder.com',
    ],
  },
};

module.exports = nextConfig;
