import { registerAs } from '@nestjs/config';

console.log('MONGODB_URI:', process.env.MONGODB_URI);

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/incidentops',
}));
