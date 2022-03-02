const os = require("os");

// to detect on with os user had used path.resolve(...)
const is_posix_os = (os.platform() !== "win32");
const version = os.release();

// For some windows version (Windows 10 v1803), it is not useful to escape spaces in path
// https://docs.microsoft.com/en-us/windows/release-information/
const windows_version_regex = /(\d+\.\d+)\.(\d+)/;
const should_not_escape = (major_release = "", os_build = "") =>
  /1\d+\.\d+/.test(major_release) && Number(os_build) >= 17134.1184;

export function escapePath (given_path: string) {
  return given_path.replace(/(\s+)/g, '^ ')
};
