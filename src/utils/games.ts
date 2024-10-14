export enum GameStatus {
  COMPLETE,
  IN_PROGRESS,
  SCHEDULED,
  POSTPONED,
  CANCELLED,
}

export const convertExternalGameStatusToInternalGameStatus = (status: string): GameStatus => {
  switch (status) {
    case "FT":
    case "AOT":
    case "AET":
    case "PEN":
    case "AP":
      return GameStatus.COMPLETE;
    case "NS":
    case "TBD":
    case "PST":
      return GameStatus.SCHEDULED;
    case "PST":
      return GameStatus.POSTPONED;
    case "CANC":
    case "SUSP":
    case "AWD":
    case "ABD":
    case "INTR":
    case "AW":
    case "WO":
      return GameStatus.CANCELLED;
    default:
      return GameStatus.IN_PROGRESS;
  }
};
