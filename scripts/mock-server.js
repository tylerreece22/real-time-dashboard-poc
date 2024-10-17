import express from 'express';
import axios from 'axios';
import mcache from 'memory-cache';

const app = express();
const port = 3001;

// Caching middleware
const cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    };
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.get('/api/items', cache(30), async (req, res) => {
    try {
        const response = await axios.get('http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/items');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});

app.get('/api/statistics', cache(30), async (req, res) => {
    try {
        const response = await axios.get('http://ec2-3-138-200-194.us-east-2.compute.amazonaws.com:8000/statistics');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Error fetching statistics');
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});
