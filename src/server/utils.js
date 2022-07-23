const path = require("path");
const os = require("os");

const { app } = require("electron");

/**
 * Get the working directory for the application.
 * @returns Working directory string.
 */
function pwd() {
    if (process.env.NODE_ENV === "development") {
        return "./dev-data";
    } else if (process.env.NODE_ENV === "ci-test") {
        return path.join(process.env.PWD, "/build");
    } else if (process.env.NODE_ENV === "test") {
        return "./test/data";
    }
    return app.getPath("appData");
}

/**
 * Get the path to the application based on ENV or platform.
 * @returns application path.
 */
const appPath = () => {
    if (process.env.NODE_ENV === "development") {
        return "./";
    } else if (process.env.NODE_ENV === "ci-test") {
        return path.join(process.env.PWD, "/build");
    } else if (process.env.NODE_ENV === "test") {
        return "./test/data";
    }
    switch (os.platform()) {
        case "darwin":
            return "/Applications/PokeTrax.app/Contents/";
        case "win32":
            return "";
        default:
            return process.env.PWD;
    }
};

module.exports = {
    appPath,
    pwd,
};
