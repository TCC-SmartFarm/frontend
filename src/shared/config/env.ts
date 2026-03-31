export const env = {
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  mapTileUrl: import.meta.env.VITE_MAP_TILE_URL as string,
  mapTileApiKey: import.meta.env.VITE_MAP_TILE_API_KEY as string,
} as const;
