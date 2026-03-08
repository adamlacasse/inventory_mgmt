type ObservabilityEnv = {
  VERCEL?: string;
  VERCEL_ENV?: string;
};

export function shouldRenderSpeedInsights(env?: ObservabilityEnv) {
  const runtimeEnv = env ?? (process.env as ObservabilityEnv);

  return (
    runtimeEnv.VERCEL === "1" &&
    (runtimeEnv.VERCEL_ENV === "preview" || runtimeEnv.VERCEL_ENV === "production")
  );
}
