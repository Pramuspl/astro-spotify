import { SpotifyApi, type PlaybackState } from "@spotify/web-api-ts-sdk";

type AccessToken = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
};

/**
 * Retrieves an access token from the Spotify API.
 *
 * @param {string} clientID - Retrieved from Spotify for Developers dashboard.
 * @param {string} clientSecret - Retrieved from Spotify for Developers dashboard.
 * @param {string} refreshToken - Retrieved using getRefreshToken() function.
 * @returns {Promise<AccessToken>} - A promise that resolves to an object containing the access token.
 */
async function getAccessToken(
  clientID: string,
  clientSecret: string,
  refreshToken: string
): Promise<AccessToken> {
  const basic = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");

  return fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      redirect_uri: "http://localhost:3000",
      refresh_token: refreshToken,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data: AccessToken) => {
      return data;
    });
}

/**
 * Retrieves a refresh token from Spotify API.
 *
 * @param clientID - Retrieved from Spotify for Developers dashboard.
 * @param clientSecret - Retrieved from Spotify for Developers dashboard.
 * @param code - The authorization code received from Spotify. Check README for details.
 * @returns A promise that resolves to the refresh token.
 */
export async function getRefreshToken(
  clientID: string,
  clientSecret: string,
  code: string
) {
  const basic = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");

  return fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000",
      code,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        return data;
      }
      return {
        "Spotify refresh token (❕❗❕ SAVE IT TO YOUR .env file AS 'SPOTIFY_REFRESH_TOKEN' ❕❗❕":
          data.refresh_token,
      };
    });
}

/**
 * Retrieves the Spotify API instance with the provided access token and refresh token.
 *
 * @param {string} clientID - Retrieved from Spotify for Developers dashboard.
 * @param {string} clientSecret - Retrieved from Spotify for Developers dashboard.
 * @param {string} refreshToken - Retrieved using getRefreshToken() function.
 * @returns {Promise<SpotifyApi>} A promise that resolves to the Spotify API instance.
 */
async function getAPI(
  clientID: string,
  clientSecret: string,
  refreshToken: string
): Promise<SpotifyApi> {
  const accessToken = await getAccessToken(
    clientID,
    clientSecret,
    refreshToken
  );
  return SpotifyApi.withAccessToken(clientID, {
    ...accessToken,
    refresh_token: refreshToken,
  });
}

type PartialPlaybackState = Omit<PlaybackState, "actions" | "context">;

/**
 * Retrieves the currently playing track from Spotify API.
 *
 * @param {string} clientID - Retrieved from Spotify for Developers dashboard.
 * @param {string} clientSecret - Retrieved from Spotify for Developers dashboard.
 * @param {string} refreshToken - Retrieved using getRefreshToken() function.
 * @returns {Promise<PartialPlaybackState|null>} - A promise that resolves to the currently playing track object, or null if no track is currently playing.
 */
export async function getCurrentlyPlayed(
  clientID: string,
  clientSecret: string,
  refreshToken: string
): Promise<PartialPlaybackState | null> {
  const api = await getAPI(clientID, clientSecret, refreshToken);
  const currentlyPlayingResponse = await api.player.getCurrentlyPlayingTrack();
  const { actions, context, ...currentlyPlaying } =
    currentlyPlayingResponse ?? {};
  return Object.keys(currentlyPlaying).length ? currentlyPlaying : null;
}
