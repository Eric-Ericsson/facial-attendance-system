/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  head: {
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: 'https://firebasestorage.googleapis.com/v0/b/twitter-v4-93513.appspot.com/o/myProjectImages%2FAsset%202.png?alt=media&token=e73cf3c5-a28c-4b7e-8067-c5f1e968a939', 
      },
    ],
  },
  images: {
    domains: ['i.pinimg.com', 'lh3.googleusercontent.com', 'lh5.googleusercontent.com', 'res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
}

module.exports = nextConfig
