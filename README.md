# Astro Spotify API Components

This package contains components interacting with the Spotify API.

## Installation

```bash
npm install astro-spotify
pnpm add astro-spotify
yarn add astro-spotify
```

## Setup

To use this package, you need a [Spotify Developer account](https://developer.spotify.com/). Create an app there to get a `Client ID` and `Client secret`.

Make sure to set the redirect URI to `http://localhost:3000`. Currently, the package only uses `Web API`.

Once you have your `Client ID` and `Client secret`, save them in your project's `.env` file as:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`.

### Authorization

To get access to your Spotify data, you need to authorize the app.

#### 1. Authorization Code

First, you'll need to get the authorization code. Open the following link in the browser, replacing:

- `<CLIENT_ID>` with your credentials:
- `<SCOPE>` depending on your usage:
  - for \<CurrentlyPlaying> Component: `user-read-currently-playing`

[https://accounts.spotify.com/authorize?client_id=\<CLIENT_ID>&redirect_uri=http://localhost:3000&scope=\<SCOPE>&response_type=code](https://accounts.spotify.com/authorize?client_id=<CLIENT_ID>&redirect_uri=http://localhost:3000&scope=<SCOPE>&response_type=code)

You'll be promopted by Spotify to allow access to your data.
Once you do it, you'll be redirected to you localhost:

`http://localhost:3000/?code=<AUTHORIZATION_CODE>`

Copy the `code` from the URL and save it. You'll need it in the next step.

#### 2. Refresh Token

The next step is getting the refresh token. The package contains a helper function to assist you with that.

```TypeScript
import { getRefreshToken } from "astro-spotify";
const refreshToken = await getRefreshToken(
  import.meta.env.SPOTIFY_CLIENT_ID,
  import.meta.env.SPOTIFY_CLIENT_SECRET,
  "<AUTHORIZATION_CODE>"
);

console.log(refreshToken);
```

Save the token in your project's `.env` file as `SPOTIFY_REFRESH_TOKEN` and remove the `getRefreshToken` call from your code as you won't need it anymore.

> ⚠️ You can only run `getRefreshToken()` once. Subsequent runs will return an error and you'd need to request a new authorization code from the previous step.

Your project's `.env` file should contain following properties:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
```

If it does, you're ready to go!

## Usage

### Currently Playing

> ⚠️ This component requires the `user-read-currently-playing` scope.

The component allows you to display the currently playing song.

```TypeScript
import { CurrentlyPlaying } from "astro-spotify";

<CurrentlyPlaying
  clientID={import.meta.env.SPOTIFY_CLIENT_ID}
  clientSecret={import.meta.env.SPOTIFY_CLIENT_SECRET}
  refreshToken={import.meta.env.SPOTIFY_REFRESH_TOKEN}
/>
```

## FAQ

### On my deployed website, the Spotify component is "frozen" and not updating on page refresh. Why?

Your website was probably rendered using SSG (Static Site Generation). This means that it was rendered once at build time and shows the state at that time.

To fix this, you need to use SSR (Server Side Rendering) either on your entire website (`server` rendering mode) or at the path containing the component (`hybrid`).

You can read more about it in [Astro Docs](https://docs.astro.build/en/guides/server-side-rendering/).
