# AES File Encryption Web Server - Configuration Examples

## Environment Variables

```bash
# Port to listen on (default: 3000)
PORT=3000

# Node environment (development | production)
NODE_ENV=production

# File upload size limit (default: 100MB in bytes)
MAX_FILE_SIZE=104857600

# File retention time in milliseconds (default: 1 hour)
FILE_RETENTION_TIME=3600000

# Enable debug logging
DEBUG=aes:*
```

## Running with Different Configurations

### Development Mode
```bash
NODE_ENV=development npm run dev
```

### Production Mode
```bash
NODE_ENV=production npm start
```

### Custom Port
```bash
PORT=8080 npm start
```

### With Debug Logging
```bash
DEBUG=* npm start
```

### Docker
```bash
docker-compose up -d
```

## Configuration Files

### server.js Settings

#### File Upload Limits
- Current: 100MB
- Edit line ~45 in server.js:
```javascript
limits: {
    fileSize: 100 * 1024 * 1024 // Adjust here
}
```

#### File Retention Time
- Current: 1 hour (3600000ms)
- Edit line ~295 in server.js:
```javascript
setTimeout(() => {
    // Cleanup code - Change interval here
}, 3600 * 1000); // 1 hour in milliseconds
```

#### Password Key Derivation
- Current: Simple padding
- Improve by uncommenting PBKDF2 section (lines ~80-90)

## Security Configuration

### HTTPS Support

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Modify server.js to use HTTPS
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(PORT);
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));
```

## Database Logging (Optional)

### MongoDB for File Audit Log

```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');

const fileLogSchema = new mongoose.Schema({
  filename: String,
  originalSize: Number,
  processedSize: Number,
  mode: String, // 'encrypt' or 'decrypt'
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  success: Boolean
});

app.post('/api/process', async (req, res) => {
  // ... existing code ...
  
  // Log to database
  const log = new FileLog({
    filename: req.file.originalname,
    originalSize: fileData.length,
    processedSize: outputData.length,
    mode: mode,
    ipAddress: req.ip,
    success: true
  });
  await log.save();
});
```

## Performance Tuning

### Node.js Cluster Mode

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  app.listen(PORT);
}
```

### Redis Caching

```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache API responses
app.get('/api/stats', (req, res) => {
  client.get('stats', (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }
    
    const stats = { /* ... */ };
    client.setex('stats', 300, JSON.stringify(stats)); // 5 min cache
    res.json(stats);
  });
});
```

## Monitoring

### PM2 Monitoring

```bash
npm install -g pm2

# Start with PM2
pm2 start server.js --name "aes-encryption"

# Monitor resource usage
pm2 monit

# Setup auto-restart
pm2 startup
pm2 save
```

### New Relic APM

```bash
npm install newrelic
```

Add at the very beginning of server.js:
```javascript
require('newrelic');
const express = require('express');
// ... rest of code
```

### Datadog APM

```bash
npm install dd-trace
```

```javascript
const tracer = require('dd-trace').init();
// ... rest of code
```

## Backup & Recovery

### Automated Backups

```javascript
const Archive = require('archiver');
const schedule = require('node-schedule');

schedule.scheduleJob('0 2 * * *', () => {
  const archive = Archive('zip', { zlib: { level: 9 } });
  const output = fs.createWriteStream('backup.zip');
  
  archive.pipe(output);
  archive.directory('uploads/', false);
  archive.finalize();
  
  console.log('Backup created');
});
```

## Troubleshooting Configuration

### Enable Verbose Logging

```javascript
// In server.js
const debug = require('debug');
const log = debug('aes:*');

// Use throughout code
log('Processing file:', filename);
```

Run with:
```bash
DEBUG=* npm start
```

### Memory Profiling

```bash
npm install clinic
clinic doctor -- node server.js
```

## Production Checklist

- [ ] Change password requirements in client-side validation
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Enable CORS appropriately
- [ ] Setup automated backups
- [ ] Configure alerting/monitoring
- [ ] Test file encryption/decryption
- [ ] Review security settings
- [ ] Setup CDN for static files
- [ ] Enable compression middleware
- [ ] Configure proper cache headers

```javascript
const compression = require('compression');
app.use(compression());
```
