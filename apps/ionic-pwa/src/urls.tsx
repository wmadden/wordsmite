export function gamesListUrl(): string {
  return "/games";
}

export type GamesDetailUrlParams = {
  gameId: string;
};
export function gamesDetailUrl({ gameId }: GamesDetailUrlParams): string {
  return `/games/${gameId}`;
}

export function gamesNewUrl(): string {
  return `/games/new`;
}

export function myUserProfileUrl(): string {
  return `/settings/profile`;
}
