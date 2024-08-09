const settings = require("./utils/settings.js")//import { settings } from './settings.js';
// --------------------------------------------------------------- [end imports]
/**
 * Log message Only when debug_mode of settings () is enabled
 */
const _log = (...args) => {
    if (settings().debug_mode) {
        console.log(`[RoundedCornersEffect] ${args}`);
    }
};
/** Always log error message  */
const _logError = (err) => {
    console.error(err);
};
/**
 * Get stack message when called this function, this method
 * will be used when monkey patch the code of gnome-shell to skip some
 * function invocations.
 */
const stackMsg = () => {
    try {
        throw Error();
    }
    catch (e) {
        return e?.stack?.trim();
    }
};
