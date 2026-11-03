import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeUsernameSocket } from './username.js';
// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    return makeUsernameSocket(newConfig);
};
export default makeWASocket;
//# sourceMappingURL=index.js.map