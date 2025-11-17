/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental : {
        serverComponentsHmrCache : false
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                // Your existing pattern for Supabase
                hostname: "fetsymbxwehbtcrliexs.supabase.co",
            },
            {
                protocol: "https",
                // This is the new pattern for Pinterest images
                // You should use the base domain, which is i.pinimg.com
                hostname: "i.pinimg.com",
                // The pathname is often necessary if the URLs have specific prefixes.
                // For this domain, using a wildcard (*) is generally safer unless you know the exact path structure.
                // We'll allow any path for simplicity.
                pathname: '/**'
            },
        ],
    }
};

export default nextConfig;