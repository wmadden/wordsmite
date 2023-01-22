export function gamesCollectionPath(): string {
  return "/Games";
}

export function gamesDocPath({ gameId }: { gameId: string }): string {
  return `/Games/${gameId}`;
}

export function userProfilesDocPath({ userId }: { userId: string }): string {
  return `/UserProfiles/${userId}`;
}

export function gameEventsCollectionPath({
  gameId,
}: {
  gameId: string;
}): string {
  return `/Games/${gameId}/GameEvents`;
}
