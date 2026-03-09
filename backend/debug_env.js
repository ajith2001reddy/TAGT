import 'dotenv/config';
import process from 'process';

console.log('ENV VALS:');
console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('PRIVATE_KEY length:', process.env.FIREBASE_PRIVATE_KEY?.length);

try {
    const firebase = await import('./src/config/firebase.js');
    console.log('SUCCESS: firebase.js loaded');
} catch (e) {
    console.error('FAILURE: firebase.js failed');
    console.error(e);
}
