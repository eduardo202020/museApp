module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    museRagUrl: process.env.EXPO_PUBLIC_MUSERAG_URL ?? "",
  },
});
