module.exports = {
  apps: [
    {
      name: "data-vault-ui",
      script: "npm",
      args: "run dev", // runs `npm run start`
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:5001" // change to backend server URL in production
      }
    }
  ]
};
