const appJson = require("./app.json");

const expoConfig = appJson.expo ?? {};
const extra = expoConfig.extra ?? {};

module.exports = () => ({
  ...expoConfig,
  extra: {
    ...extra,
    museRagUrl: process.env.EXPO_PUBLIC_MUSERAG_URL ?? "",
  },
});
