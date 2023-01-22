export function gamesCollectionPath(): string {
  return "/Games";
}

export function gamesDocPath({ gameId }: { gameId: string }): string {
  return `/Games/${gameId}`;
}

export function gameStatesCollectionPath({
  gameId,
}: {
  gameId: string;
}): string {
  return `/Games/${gameId}/GameStates`;
}

export function gameStatesCollectionGroupPath(): string {
  return `GameStates`;
}

export function gameStatesDocPath({
  gameId,
  userId,
}: {
  gameId: string;
  userId: string;
}): string {
  return `/Games/${gameId}/GameStates/${userId}`;
}

export function userProfilesDocPath({ userId }: { userId: string }): string {
  return `/UserProfiles/${userId}`;
}
