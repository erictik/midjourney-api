const mongodbUri = process.env.MONGODB_URL ? process.env.MONGODB_URL : 'mongodb://localhost:27017';

const configs = {
    mongo: { mongodbUri },
}

export default configs;