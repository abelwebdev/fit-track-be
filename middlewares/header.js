const headers = (req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "https://fit-track-fe.onrender.com/"];
  const origin = allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "https://fit-track-fe.onrender.com/";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // Must be a string

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
};

module.exports = headers;
