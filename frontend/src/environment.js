let IS_PROD = false; // Set to false to use local backend for development
const server = IS_PROD ?
"https://apnavc.onrender.com" :
"http://localhost:8000";


export default server;