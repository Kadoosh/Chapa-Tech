const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sem origin (ferramentas como Postman)
    if (!origin) return callback(null, true);

    // Permitir origens da lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Permitir qualquer IP de rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('Bloqueado pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'], // Para downloads
  maxAge: 86400, // 24 horas de cache para preflight
};

export default corsOptions;
