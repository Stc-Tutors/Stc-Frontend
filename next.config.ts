// next.config.js is the file Next.js actually loads (it prefers .js when both
// exist), so this one was silently never read and kept drifting out of sync.
// It now just re-exports the real config so the two can never disagree.
module.exports = require("./next.config.js");
